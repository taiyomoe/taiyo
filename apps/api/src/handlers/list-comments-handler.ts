import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import {
  COMMENT_SORTS,
  commentTargetSchema,
  countThreadComments,
  cursorQuerySchema,
  decodeCursor,
  encodeCursor,
  findThreadId,
  keysetAfter,
  loadCommentImages,
  loadPreviewReplies,
  resolveCommentTarget,
  rootCommentSchema,
  selectComments,
  toComment,
  visibleRootSql,
} from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = commentTargetSchema.extend({
  sort: z
    .enum(COMMENT_SORTS)
    .default("newest")
    .meta({ description: "Newest first, oldest first, or most upvoted first.", example: "newest" }),
  cursor: cursorQuerySchema,
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(config.comments.perPage)
    .meta({ description: "How many top-level comments to return (1-50).", example: 20 }),
})

export const listCommentsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List comments",
    description:
      "Lists the top-level comments on a media, chapter, group or user profile, each with its first few replies. Pages are cursor-based: pass `nextCursor` back as `cursor`.\n\n**Authentication:** optional; signed-in viewers learn which comments they upvoted and may edit or delete.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "A page of comments.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                rootCommentSchema.array(),
                z.object({
                  nextCursor: z.string().nullable(),
                  total: z
                    .int()
                    .meta({ description: "How many visible comments, replies included." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "The media, chapter, group or user doesn't exist.",
        422: "The query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  withOptionalAuth,
  async (c) => {
    const { db, viewer, can } = c.var
    const { targetType, targetId, sort, cursor, limit } = c.var.query
    const target = await resolveCommentTarget(db, { type: targetType, id: targetId })

    if (target === null) {
      return c.fail("NOT_FOUND")
    }

    const threadId = await findThreadId(db, target)

    if (threadId === null) {
      return c.ok([], { nextCursor: null, total: 0 })
    }

    const after = decodeCursor(cursor)
    let query = selectComments(db, viewer?.id ?? null)
      .where("c.threadId", "=", threadId)
      .where("c.parentId", "is", null)
      .where(visibleRootSql)

    if (after !== null) {
      query = query.where(keysetAfter(sort, after))
    }

    if (sort === "top") {
      query = query.orderBy("c.upvoteCount", "desc")
    }

    const direction = sort === "oldest" ? "asc" : "desc"
    const [rows, total] = await Promise.all([
      query
        .orderBy("c.createdAt", direction)
        .orderBy("c.id", direction)
        .limit(limit + 1)
        .execute(),
      countThreadComments(db, threadId),
    ])
    const page = rows.slice(0, limit)
    const replies = await loadPreviewReplies(
      db,
      page.map((row) => row.id),
      viewer?.id ?? null,
    )
    const images = await loadCommentImages(
      db,
      [...page, ...replies].map((row) => row.id),
      viewer?.id ?? null,
    )
    const context = {
      viewer: viewer === null ? null : { id: viewer.id, canModerate: can("comment.delete") },
      ownerId: target.ownerId,
      images,
    }
    const last = page.at(-1)

    return c.ok(
      page.map((row) => ({
        ...toComment(row, context),
        replies: replies
          .filter((reply) => reply.parentId === row.id)
          .map((reply) => toComment(reply, context)),
      })),
      { nextCursor: rows.length > limit && last !== undefined ? encodeCursor(last) : null, total },
    )
  },
)
