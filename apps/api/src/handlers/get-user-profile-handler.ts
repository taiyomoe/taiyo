import { COUNTRIES, GENDERS, LANGUAGES, sql } from "@taiyomoe/db"
import { GROUP_MEMBERSHIP_ROLES, ROLES } from "@taiyomoe/permissions"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { liveCommentSql } from "../utils/comments"
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
  nameEffect: z.string().nullable().meta({ description: "The equipped name effect, if any." }),
  avatarBorder: z.string().nullable().meta({ description: "The equipped avatar border, if any." }),
  title: z.string().nullable().meta({ description: "The equipped profile title, if any." }),
  role: z.enum(ROLES),
  createdAt: z.iso.datetime(),
  bannerUrl: z.url().nullable(),
  about: z
    .partialRecord(z.enum(LANGUAGES), z.string())
    .meta({ description: "About text, keyed by language." }),
  city: z.string().nullable(),
  country: z.enum(COUNTRIES).nullable(),
  gender: z.enum(GENDERS),
  birthDate: z.iso.date().nullable().meta({ description: "Birth date, as YYYY-MM-DD." }),
  points: z.number().int(),
  xp: z
    .number()
    .int()
    .meta({ description: "Lifetime experience: one point per page read and credited." }),
  followerCount: z.number().int(),
  followingCount: z.number().int(),
  followingHidden: z
    .boolean()
    .meta({ description: "Whether the user hides who they follow from you." }),
  uploadCount: z.number().int().meta({ description: "Published chapters the user uploaded." }),
  commentCount: z.number().int().meta({ description: "Comments left on this profile." }),
  listCount: z
    .number()
    .int()
    .meta({ description: "Lists the user owns that you can see: PUBLIC ones, or all of yours." }),
  viewerFollows: z
    .boolean()
    .nullable()
    .meta({ description: "Whether you follow this user, or null when signed out." }),
  followsViewer: z
    .boolean()
    .nullable()
    .meta({ description: "Whether this user follows you, or null when signed out." }),
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
        "users.nameEffect",
        "users.avatarBorder",
        "users.role",
        "users.settings",
        "userProfiles.banner",
        "userProfiles.about",
        "userProfiles.city",
        "userProfiles.country",
        "userProfiles.gender",
        "userProfiles.points",
        "userProfiles.title",
        sql<string | null>`to_char("userProfiles"."birthDate", 'YYYY-MM-DD')`.as("birthDate"),
        sql<string>`to_char("users"."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as("createdAt"),
      ])
      .where(sql`lower("users"."username")`, "=", username.toLowerCase())
      .where(notBanned)
      .executeTakeFirst()

    if (!user) {
      return c.fail("USER_NOT_FOUND")
    }

    const viewerId = viewer?.id ?? null
    const [counts, groups] = await Promise.all([
      db
        .selectNoFrom((eb) => [
          eb
            .selectFrom("userFollows")
            .innerJoin("users", "users.id", "userFollows.followerId")
            .where("userFollows.followingId", "=", user.id)
            .where(notBanned)
            .select(eb.fn.countAll<string>().as("count"))
            .as("followers"),
          eb
            .selectFrom("userFollows")
            .innerJoin("users", "users.id", "userFollows.followingId")
            .where("userFollows.followerId", "=", user.id)
            .where(notBanned)
            .select(eb.fn.countAll<string>().as("count"))
            .as("following"),
          eb
            .selectFrom("chapters")
            .innerJoin("medias", "medias.id", "chapters.mediaId")
            .where("chapters.uploaderId", "=", user.id)
            .where("chapters.deletedAt", "is", null)
            .where("chapters.status", "=", "PUBLISHED")
            .where("medias.deletedAt", "is", null)
            .select(eb.fn.countAll<string>().as("count"))
            .as("uploads"),
          eb
            .selectFrom("readingRewards")
            .where("readingRewards.userId", "=", user.id)
            .select((inner) =>
              inner.fn
                .coalesce(inner.fn.sum<string>("readingRewards.pages"), sql<string>`0`)
                .as("xp"),
            )
            .as("xp"),
          eb
            .selectFrom("comments as c")
            .innerJoin("commentThreads as t", "t.id", "c.threadId")
            .leftJoin("users as u", "u.id", "c.authorId")
            .where("t.profileId", "=", user.id)
            .where(liveCommentSql("c", "u"))
            .select(eb.fn.countAll<string>().as("count"))
            .as("comments"),
          eb
            .selectFrom("userLists")
            .where("userLists.userId", "=", user.id)
            .where("userLists.deletedAt", "is", null)
            .where((inner) =>
              viewerId === user.id ? inner.and([]) : inner("userLists.visibility", "=", "PUBLIC"),
            )
            .select(eb.fn.countAll<string>().as("count"))
            .as("lists"),
          viewerId === null
            ? sql<boolean>`false`.as("viewerFollows")
            : eb
                .exists(
                  eb
                    .selectFrom("userFollows")
                    .select("followerId")
                    .where("followerId", "=", viewerId)
                    .where("followingId", "=", user.id),
                )
                .as("viewerFollows"),
          viewerId === null
            ? sql<boolean>`false`.as("followsViewer")
            : eb
                .exists(
                  eb
                    .selectFrom("userFollows")
                    .select("followerId")
                    .where("followerId", "=", user.id)
                    .where("followingId", "=", viewerId),
                )
                .as("followsViewer"),
        ])
        .executeTakeFirstOrThrow(),
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
      nameEffect: user.nameEffect,
      avatarBorder: user.avatarBorder,
      title: user.title,
      role: user.role,
      createdAt: user.createdAt,
      bannerUrl: user.banner === null ? null : getPublicImageUrl(user.banner),
      about: user.about ?? {},
      city: user.city,
      country: user.country,
      gender: user.gender ?? "NOT_SPECIFIED",
      birthDate: user.birthDate,
      points: user.points ?? 0,
      xp: Number(counts.xp ?? 0),
      followerCount: Number(counts.followers ?? 0),
      followingCount: Number(counts.following ?? 0),
      followingHidden: user.settings.showFollowing === false && viewerId !== user.id,
      uploadCount: Number(counts.uploads ?? 0),
      commentCount: Number(counts.comments ?? 0),
      listCount: Number(counts.lists ?? 0),
      viewerFollows: viewer === null ? null : counts.viewerFollows === true,
      followsViewer: viewer === null ? null : counts.followsViewer === true,
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
        logoUrl: group.logo === null ? null : getPublicImageUrl(group.logo),
        role: group.role,
      })),
    })
  },
)
