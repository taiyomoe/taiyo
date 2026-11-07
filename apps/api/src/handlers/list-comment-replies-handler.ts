import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkComment } from "../middlewares/check-comment-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import {
  commentSchema,
  cursorQuerySchema,
  decodeCursor,
  encodeCursor,
  keysetAfter,
  liveCommentSql,
  loadCommentImages,
  selectComments,
  toComment,
} from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = z.object({
  cursor: cursorQuerySchema,
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(config.comments.repliesPerPage)
    .meta({ description: "How many replies to return (1-50).", example: 10 }),
})

export const listCommentRepliesHandler = new Hono().get(
  "/:id/replies",
  describeRoute({
    summary: "List a comment's replies",
    description:
      "Lists the replies to a top-level comment, oldest first. Pages are cursor-based: pass `nextCursor` back as `cursor`.\n\n**Authentication:** optional.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "A page of replies.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                commentSchema.array(),
                z.object({ nextCursor: z.string().nullable() }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No such comment exists.",
        422: "The id or query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkComment(),
  withOptionalAuth,
  async (c) => {
    const { db, viewer, can, comment } = c.var
    const { cursor, limit } = c.var.query
    const rootId = comment.parentId ?? comment.id
    const after = decodeCursor(cursor)
    let query = selectComments(db, viewer?.id ?? null)
      .where("c.parentId", "=", rootId)
      .where(liveCommentSql("c", "u"))

    if (after !== null) {
      query = query.where(keysetAfter("oldest", after))
    }

    const rows = await query
      .orderBy("c.createdAt", "asc")
      .orderBy("c.id", "asc")
      .limit(limit + 1)
      .execute()
    const page = rows.slice(0, limit)
    const images = await loadCommentImages(
      db,
      page.map((row) => row.id),
      viewer?.id ?? null,
    )
    const context = {
      viewer: viewer === null ? null : { id: viewer.id, canModerate: can("comment.delete") },
      ownerId: comment.ownerId,
      images,
    }
    const last = page.at(-1)

    return c.ok(
      page.map((row) => toComment(row, context)),
      { nextCursor: rows.length > limit && last !== undefined ? encodeCursor(last) : null },
    )
  },
)
