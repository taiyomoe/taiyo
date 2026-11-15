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
      "Replies to a comment. Replying to a reply files the answer under the same top-level comment and records which reply it answers. The author of the comment is notified, unless it is you or they turned reply notifications off.\n\n**Authentication:** signed-in user.",
    tags: ["Comments"],
    responses: {
      201: {
        description: "Reply created.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(commentSchema)) } },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No comment with the given ID exists, or it was removed.",
        422: "The provided ID is not a valid UUID, or the request body failed validation, or the reply is empty, too long, has too many images, or uses an image you cannot use.",
        429: "Too many requests, try again later.",
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
