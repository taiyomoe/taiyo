import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, userSummarySchema } from "../utils/schemas"

export const listFollowersHandler = new Hono().get(
  "/:id/followers",
  describeRoute({
    summary: "List a user's followers",
    description:
      "Lists the users who follow the user, alphabetically by username. Followers who hide who they follow are left out, unless you are the followed user or that follower.\n\n**Authentication:** optional.",
    tags: ["Follows"],
    responses: {
      200: {
        description: "The followers of the user.",
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
    const followers = db
      .selectFrom("userFollows")
      .innerJoin("users", "users.id", "userFollows.followerId")
      .where("userFollows.followingId", "=", targetUser.id)
      .where((eb) => eb.or([eb("users.banned", "is", null), eb("users.banned", "=", false)]))
      .$if(viewer?.id !== targetUser.id, (qb) =>
        qb.where((eb) =>
          eb.or([
            sql<boolean>`coalesce((${sql.ref("users.settings")} ->> 'showFollowing')::boolean, ${config.settings.showFollowing})`,
            eb("users.id", "=", viewer?.id ?? null),
          ]),
        ),
      )
    const [items, totalRow] = await Promise.all([
      followers
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
      followers.select(db.fn.countAll().as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
