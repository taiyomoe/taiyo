import { sql } from "@taiyomoe/db"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { countThreadComments, findThreadId } from "../utils/comments"
import { publishedChapters } from "../utils/group-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, storedLanguageSchema } from "../utils/schemas"

const link = (description: string, example: string) =>
  z.string().nullable().meta({ description, example })
const groupDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the group." }),
  name: z.string().meta({ description: "The name of the group.", example: "Akira Scans" }),
  description: z.string().nullable().meta({
    description: "The description of the group, if any.",
    example: "Translating seinen manga into English since 2019.",
  }),
  logo: z.string().nullable().meta({ description: "The key of the group's logo image, if any." }),
  logoUrl: z.url().nullable().meta({ description: "The URL of the group's logo, if any." }),
  banner: z
    .string()
    .nullable()
    .meta({ description: "The key of the group's banner image, if any." }),
  website: link("The URL of the group's website, if any.", "https://akira-scans.com"),
  discord: link("The Discord invite link or code of the group, if any.", "akira-scans"),
  x: link("The URL of the group's X profile, if any.", "https://x.com/akirascans"),
  facebook: link(
    "The URL of the group's Facebook page, if any.",
    "https://www.facebook.com/akirascans",
  ),
  instagram: link(
    "The URL of the group's Instagram profile, if any.",
    "https://www.instagram.com/akirascans",
  ),
  telegram: link("The URL of the group's Telegram channel, if any.", "https://t.me/akirascans"),
  youtube: link(
    "The URL of the group's YouTube channel, if any.",
    "https://www.youtube.com/@akirascans",
  ),
  email: link("The contact email of the group, if any.", "contact@akira-scans.com"),
  owned: z.boolean().meta({ description: "Whether the group has an owner." }),
  chapterCount: z
    .int()
    .meta({ description: "The number of published chapters credited to the group.", example: 342 }),
  mediaCount: z.int().meta({
    description: "The number of medias with at least one published chapter by the group.",
    example: 18,
  }),
  memberCount: z.int().meta({ description: "The number of members of the group.", example: 7 }),
  followerCount: z
    .int()
    .meta({ description: "The number of users who follow the group.", example: 128 }),
  commentCount: z
    .int()
    .meta({ description: "The number of comments on the group's page.", example: 24 }),
  languages: storedLanguageSchema("A language of the group's chapters.").array().meta({
    description: "The languages of the group's published chapters, most used first.",
  }),
  lastUploadAt: z.iso.datetime().nullable().meta({
    description: "When the group's latest chapter was released, if any.",
  }),
  createdAt: z.iso.datetime().meta({ description: "When the group was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the group was last updated." }),
})

export const getGroupHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a group",
    description:
      "Returns a group by ID, with its links and its chapter, media, member, follower and comment counts.\n\n**Authentication:** none.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "The group.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(groupDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  checkGroup(),
  async (c) => {
    const { db, group } = c.var
    const [members, chapters, languages, followers, commentCount] = await Promise.all([
      db
        .selectFrom("groupMemberships")
        .where("groupId", "=", group.id)
        .select((eb) => [
          eb.fn.countAll<string>().as("count"),
          eb.fn.countAll<string>().filterWhere("role", "=", "OWNER").as("owners"),
        ])
        .executeTakeFirstOrThrow(),
      publishedChapters(db, group.id)
        .select((eb) => [
          eb.fn.countAll<string>().as("count"),
          eb.fn.count<string>("chapters.mediaId").distinct().as("medias"),
          eb.fn.max<Date | null>("chapters.createdAt").as("lastUploadAt"),
        ])
        .executeTakeFirstOrThrow(),
      publishedChapters(db, group.id)
        .groupBy("chapters.language")
        .select(["chapters.language", sql<string>`count(*)`.as("count")])
        .orderBy("count", "desc")
        .execute(),
      db
        .selectFrom("groupFollows")
        .where("groupId", "=", group.id)
        .select((eb) => eb.fn.countAll<string>().as("count"))
        .executeTakeFirstOrThrow(),
      findThreadId(db, { type: "GROUP", id: group.id }).then((threadId) =>
        countThreadComments(db, threadId),
      ),
    ])

    return c.ok({
      id: group.id,
      name: group.name,
      description: group.description,
      logo: group.logo,
      logoUrl: group.logo === null ? null : getPublicImageUrl(group.logo),
      banner: group.banner,
      website: group.website,
      discord: group.discord,
      x: group.x,
      facebook: group.facebook,
      instagram: group.instagram,
      telegram: group.telegram,
      youtube: group.youtube,
      email: group.email,
      owned: Number(members.owners) > 0,
      chapterCount: Number(chapters.count),
      mediaCount: Number(chapters.medias),
      memberCount: Number(members.count),
      followerCount: Number(followers.count),
      commentCount,
      languages: languages.map((row) => row.language),
      lastUploadAt: chapters.lastUploadAt,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    })
  },
)
