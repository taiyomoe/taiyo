import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const followerItemSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  displayUsername: z.string(),
  image: z.string().nullable(),
  nameEffect: z.string().nullable(),
  avatarBorder: z.string().nullable(),
})

export const listFollowersHandler = new Hono().get(
  "/:id/followers",
  describeRoute({
    summary: "List followers of a user",
    description:
      "Lists the users following the given user. Followers who hide who they follow are left out, except for the followed user and themselves.\n\n**Authentication:** none.",
    tags: ["Follows"],
    responses: {
      200: {
        description: "Followers of the user.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(followerItemSchema.array(), paginationMetaSchema)),
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
