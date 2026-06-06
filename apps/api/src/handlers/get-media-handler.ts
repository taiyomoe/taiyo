import {
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  STAFF_ROLES,
} from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, languageSchema } from "../utils/schemas"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media to fetch." }),
})
const titleSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the title." }),
  title: z.string().meta({ description: "The title text.", example: "One Punch Man" }),
  language: languageSchema("The language of the title."),
  priority: z.int().meta({ description: "The display priority of the title.", example: 1 }),
  isAcronym: z.boolean().meta({ description: "Whether the title is an acronym.", example: false }),
  isMainTitle: z
    .boolean()
    .meta({ description: "Whether this is the main title of the media.", example: true }),
})
const coverSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the cover." }),
  volume: z
    .string()
    .nullable()
    .meta({ description: "The volume this cover represents, if any.", example: "1" }),
  language: languageSchema("The language of the cover."),
  contentRating: contentRatingSchema("The content rating of the cover."),
  isMainCover: z
    .boolean()
    .meta({ description: "Whether this is the main cover of the media.", example: true }),
})
const bannerSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the banner." }),
  contentRating: contentRatingSchema("The content rating of the banner."),
})
const staffSchema = z.object({
  staffId: z.uuid().meta({ description: "The ID of the staff member." }),
  name: z.string().meta({ description: "The name of the staff member.", example: "ONE" }),
  role: z
    .enum(STAFF_ROLES)
    .meta({ description: "The role of the staff member for this media.", example: "AUTHOR" }),
})
const mediaDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  createdAt: z.iso.datetime().meta({ description: "When the media was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the media was last updated." }),
  startDate: z.iso.datetime().nullable().meta({ description: "The release start date." }),
  endDate: z.iso.datetime().nullable().meta({ description: "The release end date." }),
  synopsis: z
    .record(z.string(), z.string())
    .meta({ description: "The synopsis of the media, keyed by language." }),
  contentRating: contentRatingSchema("The content rating of the media."),
  type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media." }),
  status: z.enum(MEDIA_STATUSES).meta({ description: "The current release status." }),
  source: z.enum(MEDIA_SOURCES).meta({ description: "The original source of the media." }),
  demography: z.enum(MEDIA_DEMOGRAPHIES).meta({ description: "The target audience." }),
  countryOfOrigin: z
    .enum(MEDIA_COUNTRIES_OF_ORIGIN)
    .meta({ description: "The country where the media was originally created." }),
  tags: z
    .object({
      key: z.string().meta({ description: "The tag key.", example: "COWBOYS" }),
      isSpoiler: z.boolean().meta({ description: "Whether the tag is a spoiler." }),
    })
    .array()
    .nullable()
    .meta({ description: "Tags describing themes and elements of the media." }),
  links: z
    .record(z.string(), z.union([z.string(), z.number()]))
    .meta({ description: "External references for this media, keyed by provider." }),
  creatorId: z.uuid().meta({ description: "The ID of the user who created the media." }),
  titles: titleSchema.array().meta({ description: "The titles of the media." }),
  covers: coverSchema.array().meta({ description: "The covers of the media." }),
  banners: bannerSchema.array().meta({ description: "The banners of the media." }),
  staffs: staffSchema.array().meta({ description: "The staff members credited on this media." }),
})

export const getMediaHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a media by id",
    description:
      "Returns a single media along with its titles, covers, banners, external links and staff credits.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Media retrieved successfully.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(mediaDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  validateParam(paramSchema),
  async (c) => {
    const { db, log } = c.var
    const { id } = c.var.param

    log.set({ media: { id } })

    const media = await db
      .selectFrom("medias")
      .select([
        "id",
        "createdAt",
        "updatedAt",
        "startDate",
        "endDate",
        "synopsis",
        "contentRating",
        "type",
        "status",
        "source",
        "demography",
        "countryOfOrigin",
        "tags",
        "flag",
        "links",
        "creatorId",
      ])
      .where("id", "=", id)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    if (!media) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    log.set({ media })

    const [titles, covers, banners, staffs] = await Promise.all([
      db
        .selectFrom("titles")
        .select(["id", "title", "language", "priority", "isAcronym", "isMainTitle"])
        .where("mediaId", "=", id)
        .where("deletedAt", "is", null)
        .execute(),
      db
        .selectFrom("covers")
        .select(["id", "volume", "language", "contentRating", "isMainCover"])
        .where("mediaId", "=", id)
        .where("deletedAt", "is", null)
        .execute(),
      db
        .selectFrom("banners")
        .select(["id", "contentRating"])
        .where("mediaId", "=", id)
        .where("deletedAt", "is", null)
        .execute(),
      db
        .selectFrom("mediaStaffs")
        .innerJoin("staffs", "staffs.id", "mediaStaffs.staffId")
        .where("mediaStaffs.mediaId", "=", id)
        .where("staffs.deletedAt", "is", null)
        .select(["staffs.id as staffId", "staffs.name", "mediaStaffs.role"])
        .execute(),
    ])

    return c.ok({ ...media, titles, covers, banners, staffs })
  },
)
