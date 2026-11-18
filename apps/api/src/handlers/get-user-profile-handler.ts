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
  username: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .meta({ description: "The username of the user, case-insensitive.", example: "kaito" }),
})
const userProfileSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the user." }),
  username: z.string().meta({ description: "The username of the user.", example: "kaito" }),
  displayUsername: z
    .string()
    .meta({ description: "The display name of the user.", example: "Kaito" }),
  image: z.string().nullable().meta({ description: "The URL of the user's avatar, if any." }),
  nameEffect: z
    .string()
    .nullable()
    .meta({ description: "The name effect the user has equipped, if any.", example: "sunrise" }),
  avatarBorder: z
    .string()
    .nullable()
    .meta({ description: "The avatar border the user has equipped, if any." }),
  title: z
    .string()
    .nullable()
    .meta({ description: "The profile title the user has equipped, if any." }),
  role: z.enum(ROLES).meta({ description: "The role of the user.", example: "UPLOADER" }),
  createdAt: z.iso.datetime().meta({ description: "When the user signed up." }),
  bannerUrl: z.url().nullable().meta({ description: "The URL of the user's banner, if any." }),
  about: z.partialRecord(z.enum(LANGUAGES), z.string()).meta({
    description: "The about text of the user, keyed by language.",
    example: { en: "Translating seinen since 2019." },
  }),
  city: z
    .string()
    .nullable()
    .meta({ description: "The city of the user, if any.", example: "Lisbon" }),
  country: z
    .enum(COUNTRIES)
    .nullable()
    .meta({ description: "The country of the user, if any.", example: "pt" }),
  gender: z
    .enum(GENDERS)
    .meta({ description: "The gender of the user.", example: "NOT_SPECIFIED" }),
  birthDate: z.iso
    .date()
    .nullable()
    .meta({ description: "The birth date of the user, if any.", example: "1998-04-12" }),
  points: z.int().meta({ description: "The number of points the user can spend.", example: 1250 }),
  xp: z.int().meta({
    description: "The lifetime experience of the user: one point per page read and credited.",
    example: 48210,
  }),
  followerCount: z
    .int()
    .meta({ description: "The number of users following the user.", example: 37 }),
  followingCount: z
    .int()
    .meta({ description: "The number of users the user follows.", example: 12 }),
  followingHidden: z
    .boolean()
    .meta({ description: "Whether the user hides who they follow from you." }),
  uploadCount: z.int().meta({
    description: "The number of published chapters the user uploaded.",
    example: 214,
  }),
  commentCount: z
    .int()
    .meta({ description: "The number of comments on the user's profile.", example: 9 }),
  listCount: z.int().meta({
    description:
      "The number of lists the user owns that you can see: PUBLIC ones, or all of them when the user is you.",
    example: 3,
  }),
  viewerFollows: z
    .boolean()
    .nullable()
    .meta({ description: "Whether you follow the user, or null when you are signed out." }),
  followsViewer: z
    .boolean()
    .nullable()
    .meta({ description: "Whether the user follows you, or null when you are signed out." }),
  groups: z
    .object({
      id: z.uuid().meta({ description: "The ID of the group." }),
      name: z.string().meta({ description: "The name of the group.", example: "Sunray Scans" }),
      logoUrl: z.url().nullable().meta({ description: "The URL of the group's logo, if any." }),
      role: z
        .enum(GROUP_MEMBERSHIP_ROLES)
        .meta({ description: "The role of the user in the group.", example: "MEMBER" }),
    })
    .array()
    .meta({ description: "The groups the user belongs to, alphabetically by name." }),
})

export const getUserProfileHandler = new Hono().get(
  "/by-username/:username",
  describeRoute({
    summary: "Get a user's profile",
    description:
      "Returns the profile of the user with the given username: identity, about text, counts and the groups the user belongs to. Banned users are not found, except by moderators and admins, who need their profile to clean it up. Signed-in viewers also see whether they follow the user and whether the user follows them.\n\n**Authentication:** optional.",
    tags: ["Users"],
    responses: {
      200: {
        description: "The user's profile.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(userProfileSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given username exists, or the user is banned and you are not a moderator or admin.",
        422: "The provided username is not valid.",
      }),
    },
  }),
  validateParam(paramSchema),
  withOptionalAuth,
  async (c) => {
    const { db, viewer, can } = c.var
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
      .$if(!can("user.list"), (query) => query.where(notBanned))
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
