import { commentAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkComment } from "../middlewares/check-comment-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import {
  checkContent,
  commentSchema,
  contentSchema,
  loadComment,
  saveImageUsages,
} from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({ content: contentSchema })

export const createCommentReplyHandler = new Hono().post(
  "/:id/replies",
  describeRoute({
    summary: "Reply to a comment",
    description:
      "Replies to a comment. Replying to a reply files the answer under the same top-level comment and records who it answers.\n\n**Authentication:** signed-in user.",
    tags: ["Comments"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Reply posted.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(commentSchema)) } },
      },
      ...getOpenApiResponses({
        404: "The comment doesn't exist or was removed.",
        422: "The reply is empty, too long, has too many images, or uses an image you can't use.",
        429: "Too many requests — slow down.",
      }),
    },
  }),
  audited(commentAudit.CREATE, (c) => ({ parentId: c.req.param("id") })),
  withAuth("comment.create"),
  rateLimit({ prefix: "create-comment", windowMs: 60_000, limit: 10 }),
  validateJson(bodySchema),
  withTransaction,
  checkComment({ live: true }),
  async (c) => {
    const { db, user, can, comment, afterCommit, notificationEvents } = c.var
    const { content } = c.var.json
    const checked = await checkContent(db, content, { userId: user.id })

    if ("error" in checked) {
      return c.fail(checked.error)
    }

    const { id } = await db
      .insertInto("comments")
      .values({
        threadId: comment.threadId,
        parentId: comment.parentId ?? comment.id,
        replyToId: comment.parentId === null ? null : comment.id,
        authorId: user.id,
        content,
      })
      .returning("id")
      .executeTakeFirstOrThrow()

    await saveImageUsages(db, id, checked.imageIds)

    const { authorId } = comment
    const author =
      authorId === null || authorId === user.id
        ? undefined
        : await db
            .selectFrom("users")
            .select(
              sql<boolean>`coalesce(("settings" ->> 'notifyReplies')::boolean, ${config.settings.notifyReplies})`.as(
                "notify",
              ),
            )
            .where("id", "=", authorId)
            .executeTakeFirst()

    if (authorId !== null && author?.notify === true) {
      await db
        .insertInto("notifications")
        .values({ userId: authorId, type: "COMMENT_REPLY", commentId: id })
        .execute()
      afterCommit(() => notificationEvents.publish([authorId]))
    }

    c.var.audit.set({ target: { id } })

    return c.ok(
      await loadComment(db, id, {
        viewer: { id: user.id, canModerate: can("comment.delete") },
        ownerId: comment.ownerId,
      }),
    )
  },
)
