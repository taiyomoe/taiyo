import { commentAudit } from "@taiyomoe/audit"
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

export const updateCommentHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a comment",
    description:
      "Updates the text of one of your comments. It is marked as edited, and moderators can see the previous versions. Images already in the comment can stay even if you no longer have them.\n\n**Required access:** the author of the comment.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "Comment updated.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(commentSchema)) } },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are not the author of the comment, or you do not have permission to perform this action.",
        404: "No comment with the given ID exists, or it was removed.",
        422: "The provided ID is not a valid UUID, or the request body failed validation, or the comment is empty, too long, has too many images, or uses an image you cannot use.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(commentAudit.UPDATE),
  withAuth(),
  rateLimit({ prefix: "update-comment", windowMs: 60_000, limit: 20 }),
  validateJson(bodySchema),
  withTransaction,
  checkComment({ live: true }),
  async (c) => {
    const { db, user, can, comment } = c.var
    const { content } = c.var.json

    if (comment.authorId !== user.id) {
      return c.fail("FORBIDDEN")
    }

    const viewer = { id: user.id, canModerate: can("comment.delete") }
    const current = await db
      .selectFrom("comments")
      .select(["content", "createdAt", "editedAt"])
      .where("id", "=", comment.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (current.content === content) {
      return c.ok(await loadComment(db, comment.id, { viewer, ownerId: comment.ownerId }))
    }

    const checked = await checkContent(db, content, { userId: user.id, commentId: comment.id })

    if ("error" in checked) {
      return c.fail(checked.error)
    }

    await db
      .insertInto("commentRevisions")
      .values({
        commentId: comment.id,
        content: current.content,
        createdAt: current.editedAt ?? current.createdAt,
      })
      .execute()
    await db
      .updateTable("comments")
      .set({ content, editedAt: sql<Date>`CURRENT_TIMESTAMP` })
      .where("id", "=", comment.id)
      .execute()
    await saveImageUsages(db, comment.id, checked.imageIds)

    return c.ok(await loadComment(db, comment.id, { viewer, ownerId: comment.ownerId }))
  },
)
