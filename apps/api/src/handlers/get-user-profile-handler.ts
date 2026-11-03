import { sql } from "@taiyomoe/db"
import { GROUP_MEMBERSHIP_ROLES, ROLES } from "@taiyomoe/permissions"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { isBannedSql } from "../utils/user-moderation"

const paramSchema = z.object({
  username: z.string().trim().min(1).max(100),
})
const userProfileSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  displayUsername: z.string(),
  image: z.string().nullable(),
  role: z.enum(ROLES),
  createdAt: z.iso.datetime(),
  bannerUrl: z.url().nullable(),
  about: z.record(z.string(), z.string()).meta({ description: "About text, keyed by language." }),
  followerCount: z.number().int(),
  followingCount: z.number().int(),
  viewerFollows: z
    .boolean()
    .nullable()
    .meta({ description: "Whether you follow this user, or null when signed out." }),
  groups: z
    .object({
      id: z.uuid(),
      name: z.string(),
      logoUrl: z.url().nullable(),
      role: z.enum(GROUP_MEMBERSHIP_ROLES),
    })
    .array(),
})

export const getUserProfileHandler = new Hono().get(
  "/by-username/:username",
  describeRoute({
    summary: "Get a user profile",
    description:
      "Fetches the public profile of a user by username (case-insensitive): identity, about text, follow counts and the groups they belong to. Banned users are not found.\n\n**Authentication:** optional; signed-in viewers also learn whether they follow the user.",
    tags: ["Users"],
    responses: {
      200: {
        description: "The user profile.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(userProfileSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given username exists.",
        422: "The username failed validation.",
      }),
    },
  }),
  validateParam(paramSchema),
  withOptionalAuth,
  async (c) => {
    const { db, viewer } = c.var
    const notBanned = sql<boolean>`not (${isBannedSql})`
    const { username } = c.var.param
    const user = await db
      .selectFrom("users")
      .leftJoin("userProfiles", "userProfiles.userId", "users.id")
      .select([
        "users.id",
        "users.username",
        "users.displayUsername",
        "users.image",
        "users.role",
        "userProfiles.banner",
        "userProfiles.about",
        sql<string>`to_char("users"."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as("createdAt"),
      ])
      .where(sql`lower("users"."username")`, "=", username.toLowerCase())
      .where(notBanned)
      .executeTakeFirst()

    if (!user) {
      return c.fail("USER_NOT_FOUND")
    }

    const [followers, following, viewerFollow, groups] = await Promise.all([
      db
        .selectFrom("userFollows")
        .innerJoin("users", "users.id", "userFollows.followerId")
        .where("userFollows.followingId", "=", user.id)
        .where(notBanned)
        .select(db.fn.countAll<string>().as("count"))
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("userFollows")
        .innerJoin("users", "users.id", "userFollows.followingId")
        .where("userFollows.followerId", "=", user.id)
        .where(notBanned)
        .select(db.fn.countAll<string>().as("count"))
        .executeTakeFirstOrThrow(),
      viewer === null
        ? null
        : db
            .selectFrom("userFollows")
            .select("followerId")
            .where("followerId", "=", viewer.id)
            .where("followingId", "=", user.id)
            .executeTakeFirst(),
      db
        .selectFrom("groupMemberships")
        .innerJoin("groups", "groups.id", "groupMemberships.groupId")
        .select(["groups.id", "groups.name", "groups.logo", "groupMemberships.role"])
        .where("groupMemberships.userId", "=", user.id)
        .where("groups.deletedAt", "is", null)
        .orderBy("groups.name", "asc")
        .execute(),
    ])

    return c.ok({
      id: user.id,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      bannerUrl: user.banner === null ? null : getPublicImageUrl(user.banner),
      about: user.about ?? {},
      followerCount: Number(followers.count),
      followingCount: Number(following.count),
      viewerFollows: viewer === null ? null : viewerFollow !== undefined,
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
        logoUrl: group.logo === null ? null : getPublicImageUrl(group.logo),
        role: group.role,
      })),
    })
  },
)
