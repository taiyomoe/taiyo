import { commentAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { audited } from "../middlewares/audited-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import {
  checkContent,
  commentSchema,
  commentTargetSchema,
  contentSchema,
  ensureThreadId,
  loadComment,
  resolveCommentTarget,
  saveImageUsages,
} from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = commentTargetSchema.extend({ content: contentSchema })

export const createCommentHandler = new Hono().post(
  "/",
  describeRoute({
    summary: "Post a comment",
    description:
      "Posts a top-level comment on a media, chapter, group or user profile. Images must be ones you uploaded or added to your favorites.\n\n**Authentication:** signed-in user.",
    tags: ["Comments"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Comment posted.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(commentSchema)) } },
      },
      ...getOpenApiResponses({
        404: "The media, chapter, group or user doesn't exist.",
        422: "The comment is empty, too long, has too many images, or uses an image you can't use.",
        429: "Too many requests — slow down.",
      }),
    },
  }),
  audited(commentAudit.CREATE, () => ({})),
  withAuth("comment.create"),
  rateLimit({ prefix: "create-comment", windowMs: 60_000, limit: 10 }),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user, can } = c.var
    const { targetType, targetId, content } = c.var.json
    const target = await resolveCommentTarget(db, { type: targetType, id: targetId })

    c.var.audit.set({ target: { targetType, targetId } })

    if (target === null) {
      return c.fail("NOT_FOUND")
    }

    const checked = await checkContent(db, content, { userId: user.id })

    if ("error" in checked) {
      return c.fail(checked.error)
    }

    const threadId = await ensureThreadId(db, target)
    const { id } = await db
      .insertInto("comments")
      .values({ threadId, authorId: user.id, content })
      .returning("id")
      .executeTakeFirstOrThrow()

    await saveImageUsages(db, id, checked.imageIds)
    c.var.audit.set({ target: { id } })

    return c.ok(
      await loadComment(db, id, {
        viewer: { id: user.id, canModerate: can("comment.delete") },
        ownerId: target.ownerId,
      }),
    )
  },
)
