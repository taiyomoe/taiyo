import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const followingItemSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  displayUsername: z.string(),
  image: z.string().nullable(),
  nameEffect: z.string().nullable(),
})

export const listFollowingHandler = new Hono().get(
  "/:id/following",
  describeRoute({
    summary: "List users the given user follows",
    description:
      "Lists the users that the given user is following. The list is empty when the user hides it, unless you are that user.\n\n**Authentication:** optional.",
    tags: ["Follows"],
    responses: {
      200: {
        description: "Users the given user follows.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(followingItemSchema.array(), paginationMetaSchema)),
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
