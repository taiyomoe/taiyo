import { COMMENT_TARGET_TYPES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkComment } from "../middlewares/check-comment-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import {
  getThreadTarget,
  liveCommentSql,
  loadCommentImages,
  rootCommentSchema,
  selectComments,
  toComment,
  visibleRootSql,
} from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const getCommentContextHandler = new Hono().get(
  "/:id/context",
  describeRoute({
    summary: "Get a comment in context",
    description:
      "Returns a comment for a permalink: its top-level comment, and the linked reply under it when the link points at a reply.\n\n**Authentication:** optional.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "The linked comment.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  target: z.object({ type: z.enum(COMMENT_TARGET_TYPES), id: z.uuid() }),
                  comment: rootCommentSchema.meta({
                    description: "The top-level comment. `replies` holds only the linked reply.",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 404: "No such comment exists, or it was removed." }),
    },
  }),
  checkComment(),
  withOptionalAuth,
  async (c) => {
    const { db, viewer, can, comment } = c.var
    const viewerId = viewer?.id ?? null
    const rootId = comment.parentId ?? comment.id
    const [root, reply] = await Promise.all([
      selectComments(db, viewerId)
        .where("c.id", "=", rootId)
        .where(visibleRootSql)
        .executeTakeFirst(),
      comment.parentId === null
        ? Promise.resolve(undefined)
        : selectComments(db, viewerId)
            .where("c.id", "=", comment.id)
            .where(liveCommentSql("c", "u"))
            .executeTakeFirst(),
    ])

    if (root === undefined || (comment.parentId !== null && reply === undefined)) {
      return c.fail("COMMENT_NOT_FOUND")
    }

    const images = await loadCommentImages(
      db,
      reply === undefined ? [root.id] : [root.id, reply.id],
      viewerId,
    )
    const context = {
      viewer: viewer === null ? null : { id: viewer.id, canModerate: can("comment.delete") },
      ownerId: comment.ownerId,
      images,
    }

    return c.ok({
      target: await getThreadTarget(db, comment.threadId),
      comment: {
        ...toComment(root, context),
        replies: reply === undefined ? [] : [toComment(reply, context)],
      },
    })
  },
)
