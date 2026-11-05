import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { groupCommentSchema, selectGroupComments, toGroupComment } from "../utils/group-comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000).meta({ description: "The comment's text." }),
})

export const createGroupCommentHandler = new Hono().post(
  "/:id/comments",
  describeRoute({
    summary: "Comment on a group",
    description: "Leaves a comment on the group's page.\n\n**Authentication:** any signed-in user.",
    tags: ["Group comments"],
    requestBody: {
      content: { "application/json": await resolver(createCommentSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Comment posted.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(groupCommentSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The request data failed validation.",
        429: "Too many requests — slow down.",
      }),
    },
  }),
  withAuth("comment.create"),
  rateLimit({ prefix: "group-comment", windowMs: 60_000, limit: 10 }),
  validateJson(createCommentSchema),
  checkGroup(),
  async (c) => {
    const { db, group, user } = c.var
    const { id } = await db
      .insertInto("groupComments")
      .values({ groupId: group.id, userId: user.id, content: c.var.json.content })
      .returning("id")
      .executeTakeFirstOrThrow()
    const row = await selectGroupComments(db, group.id)
      .where("groupComments.id", "=", id)
      .executeTakeFirstOrThrow()

    return c.ok(toGroupComment(row))
  },
)
