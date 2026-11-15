import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, userSummarySchema } from "../utils/schemas"

export const listFollowingHandler = new Hono().get(
  "/:id/following",
  describeRoute({
    summary: "List the users a user follows",
    description:
      "Lists the users the user follows, alphabetically by username. The list is empty when the user hides it, unless you are that user.\n\n**Authentication:** optional.",
    tags: ["Follows"],
    responses: {
      200: {
        description: "The users the user follows.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(userSummarySchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given ID exists, or the user is banned.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(paginationQuerySchema),
  checkUser(),
  withOptionalAuth,
  async (c) => {
    const { db, targetUser, viewer } = c.var
    const { page, perPage } = c.var.query

    if (targetUser.settings.showFollowing === false && viewer?.id !== targetUser.id) {
      return c.ok([], { page, perPage, total: 0 })
    }

    const [items, totalRow] = await Promise.all([
      db
        .selectFrom("userFollows")
        .innerJoin("users", "users.id", "userFollows.followingId")
        .where("userFollows.followerId", "=", targetUser.id)
        .where((eb) => eb.or([eb("users.banned", "is", null), eb("users.banned", "=", false)]))
        .select([
          "users.id",
          "users.username",
          "users.displayUsername",
          "users.image",
          "users.nameEffect",
          "users.avatarBorder",
        ])
        .orderBy("users.username", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("userFollows")
        .innerJoin("users", "users.id", "userFollows.followingId")
        .where("userFollows.followerId", "=", targetUser.id)
        .where((eb) => eb.or([eb("users.banned", "is", null), eb("users.banned", "=", false)]))
        .select(db.fn.countAll().as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
