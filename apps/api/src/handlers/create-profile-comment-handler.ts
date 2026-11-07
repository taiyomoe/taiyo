import { profileCommentAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  profileCommentSchema,
  selectProfileComments,
  toProfileComment,
} from "../utils/profile-comments"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1)
    .max(1000)
    .meta({ description: "The comment, 1 to 1000 characters.", example: "+rep great uploads!" }),
})

export const createProfileCommentHandler = new Hono().post(
  "/:id/comments",
  describeRoute({
    summary: "Comment on a profile",
    description: "Leaves a comment on a user's profile.\n\n**Authentication:** signed-in user.",
    tags: ["Profile comments"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Comment created.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(profileCommentSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given id exists.",
        422: "The request data failed validation.",
        429: "Too many requests — slow down.",
      }),
    },
  }),
  audited(profileCommentAudit.CREATE),
  withAuth(),
  rateLimit({ prefix: "create-profile-comment", windowMs: 60_000, limit: 10 }),
  validateJson(bodySchema),
  checkUser(),
  async (c) => {
    const { db, user, targetUser, can } = c.var
    const { id } = await db
      .insertInto("userProfileComments")
      .values({ profileId: targetUser.id, authorId: user.id, content: c.var.json.content })
      .returning("id")
      .executeTakeFirstOrThrow()
    const row = await selectProfileComments(db)
      .where("userProfileComments.id", "=", id)
      .executeTakeFirstOrThrow()

    c.var.audit.set({ target: { commentId: id } })

    return c.ok(toProfileComment(row, { id: user.id, canModerate: can("comment.delete") }))
  },
)
