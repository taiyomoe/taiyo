import { LANGUAGES, sql } from "@taiyomoe/db"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { countThreadComments, findThreadId } from "../utils/comments"
import { publishedChapters } from "../utils/group-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const groupDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the group." }),
  name: z.string().meta({ description: "Name of the group." }),
  description: z.string().nullable(),
  logo: z.string().nullable(),
  logoUrl: z.url().nullable().meta({ description: "Public URL of the group logo, if any." }),
  banner: z.string().nullable(),
  website: z.string().nullable(),
  discord: z.string().nullable(),
  x: z.string().nullable(),
  facebook: z.string().nullable(),
  instagram: z.string().nullable(),
  telegram: z.string().nullable(),
  youtube: z.string().nullable(),
  email: z.string().nullable(),
  owned: z.boolean().meta({ description: "Whether the group has an owner." }),
  chapterCount: z.int().meta({ description: "Published chapters credited to the group." }),
  mediaCount: z.int().meta({ description: "Medias with at least one chapter by the group." }),
  memberCount: z.int(),
  followerCount: z.int(),
  commentCount: z.int(),
  languages: z.enum(LANGUAGES).array().meta({
    description: "Languages of the group's chapters, most used first.",
  }),
  lastUploadAt: z.iso.datetime().nullable().meta({
    description: "When the group's latest chapter was released.",
  }),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const getGroupHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a group",
    description: "Fetches a group by id.\n\n**Authentication:** none.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "Group details.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(groupDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The provided id is not a valid UUID.",
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
