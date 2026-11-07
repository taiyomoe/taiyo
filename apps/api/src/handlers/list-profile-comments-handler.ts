import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  profileCommentSchema,
  selectProfileComments,
  toProfileComment,
} from "../utils/profile-comments"
import { apiSuccessEnvelope } from "../utils/schemas"

export const listProfileCommentsHandler = new Hono().get(
  "/:id/comments",
  describeRoute({
    summary: "List a user's profile comments",
    description:
      "Lists the comments left on a user's profile, newest first.\n\n**Authentication:** optional; signed-in viewers learn which comments they may delete.",
    tags: ["Profile comments"],
    responses: {
      200: {
        description: "The profile's comments.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(profileCommentSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given id exists.",
        422: "The provided id is not a valid UUID or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(paginationQuerySchema),
  checkUser(),
  withOptionalAuth,
  async (c) => {
    const { db, targetUser, viewer, can } = c.var
    const { page, perPage } = c.var.query
    const base = selectProfileComments(db).where(
      "userProfileComments.profileId",
      "=",
      targetUser.id,
    )
    const [rows, totalRow] = await Promise.all([
      base
        .orderBy("userProfileComments.createdAt", "desc")
        .orderBy("userProfileComments.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base
        .clearSelect()
        .select((eb) => eb.fn.countAll<string>().as("count"))
        .executeTakeFirstOrThrow(),
    ])
    const actor = viewer === null ? null : { id: viewer.id, canModerate: can("comment.delete") }

    return c.ok(
      rows.map((row) => toProfileComment(row, actor)),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
