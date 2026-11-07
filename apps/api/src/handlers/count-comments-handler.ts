import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import {
  commentTargetSchema,
  countThreadComments,
  findThreadId,
  resolveCommentTarget,
} from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const countCommentsHandler = new Hono().get(
  "/count",
  describeRoute({
    summary: "Count comments",
    description:
      "Counts the visible comments, replies included, on a media, chapter, group or user profile.\n\n**Authentication:** none.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "The comment count.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ total: z.int() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "The media, chapter, group or user doesn't exist.",
        422: "The query parameters failed validation.",
      }),
    },
  }),
  validateQuery(commentTargetSchema),
  async (c) => {
    const { db } = c.var
    const { targetType, targetId } = c.var.query
    const target = await resolveCommentTarget(db, { type: targetType, id: targetId })

    if (target === null) {
      return c.fail("NOT_FOUND")
    }

    return c.ok({ total: await countThreadComments(db, await findThreadId(db, target)) })
  },
)
