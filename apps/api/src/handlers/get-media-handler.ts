import {
  FLAGS,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  STAFF_ROLES,
} from "@taiyomoe/db"
import { getBannerUrl, getCoverUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingSchema,
  mediaLinksSchema,
  storedLanguageSchema,
  storedLocalizedTextSchema,
} from "../utils/schemas"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
})
const titleSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the title." }),
  title: z.string().meta({ description: "The text of the title.", example: "One Punch Man" }),
  language: storedLanguageSchema("The language of the title."),
  priority: z.int().meta({
    description: "The rank of the title among the titles of its language, 1 first.",
    example: 1,
  }),
  isAcronym: z.boolean().meta({ description: "Whether the title is an acronym.", example: false }),
  isMainTitle: z
    .boolean()
    .meta({ description: "Whether the title is the main title of the media.", example: true }),
})
const coverSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the cover." }),
  url: z.url().meta({
    description: "The URL of the cover image.",
    example:
      "https://cdn.taiyo.moe/medias/4e26b80f-6661-4f5f-93b4-6dfed052bbed/covers/a56cc54d-7776-4787-9b21-97a4674b80bc.jpg",
  }),
  volume: z
    .string()
    .nullable()
    .meta({ description: "The volume the cover belongs to, if any.", example: "1" }),
  language: storedLanguageSchema("The language of the cover."),
  contentRating: contentRatingSchema("The content rating of the cover."),
  isMainCover: z
    .boolean()
    .meta({ description: "Whether the cover is the main cover of the media.", example: true }),
})
const bannerSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the banner." }),
  url: z.url().meta({
    description: "The URL of the banner image.",
    example:
      "https://cdn.taiyo.moe/medias/4e26b80f-6661-4f5f-93b4-6dfed052bbed/banners/8f2c1d7e-5a3b-4c9d-b1e0-6a7f8d9c0b1a.jpg",
  }),
  contentRating: contentRatingSchema("The content rating of the banner."),
})
const staffSchema = z.object({
  staffId: z.uuid().meta({ description: "The ID of the staff." }),
  name: z.string().meta({ description: "The name of the staff.", example: "ONE" }),
  role: z
    .enum(STAFF_ROLES)
    .meta({ description: "The role of the staff on the media.", example: "AUTHOR" }),
})
const mediaDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  createdAt: z.iso.datetime().meta({ description: "When the media was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the media was last updated." }),
  startDate: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the media started releasing, if any." }),
  endDate: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the media finished releasing, if any." }),
  synopsis: storedLocalizedTextSchema.meta({
    description: "The synopsis of the media, keyed by language code.",
  }),
  contentRating: contentRatingSchema("The content rating of the media."),
  type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media.", example: "MANGA" }),
  status: z
    .enum(MEDIA_STATUSES)
    .meta({ description: "The release status of the media.", example: "RELEASING" }),
  source: z
    .enum(MEDIA_SOURCES)
    .meta({ description: "The original source of the media.", example: "ORIGINAL" }),
  demography: z
    .enum(MEDIA_DEMOGRAPHIES)
    .meta({ description: "The target audience of the media.", example: "SHOUNEN" }),
  countryOfOrigin: z
    .enum(MEDIA_COUNTRIES_OF_ORIGIN)
    .meta({ description: "The country the media originates from.", example: "JAPAN" }),
  tags: z
    .object({
      key: z.string().meta({ description: "The key of the tag.", example: "COWBOYS" }),
      isSpoiler: z.boolean().meta({ description: "Whether the tag is a spoiler." }),
    })
    .array()
    .nullable()
    .meta({ description: "The tags describing the elements and themes of the media, if any." }),
  flag: z.enum(FLAGS).meta({ description: "The moderation flag of the media.", example: "OK" }),
  links: mediaLinksSchema,
  creatorId: z.uuid().meta({ description: "The ID of the user who created the media." }),
  titles: titleSchema.array().meta({ description: "The titles of the media." }),
  covers: coverSchema.array().meta({ description: "The covers of the media." }),
  banners: bannerSchema.array().meta({ description: "The banners of the media." }),
  staffs: staffSchema.array().meta({ description: "The staff credited on the media." }),
})

export const getMediaHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a media",
    description:
      "Returns a media by ID, with its titles, covers, banners, links and staff credits.\n\n**Authentication:** none.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "The media.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(mediaDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
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
        .select(["id", "extension", "volume", "language", "contentRating", "isMainCover"])
        .where("mediaId", "=", id)
        .where("deletedAt", "is", null)
        .execute(),
      db
        .selectFrom("banners")
        .select(["id", "extension", "contentRating"])
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

    return c.ok({
      ...media,
      titles,
      covers: covers.map(({ extension, ...cover }) => ({
        ...cover,
        url: getCoverUrl(id, cover.id, extension),
      })),
      banners: banners.map(({ extension, ...banner }) => ({
        ...banner,
        url: getBannerUrl(id, banner.id, extension),
      })),
      staffs,
    })
  },
)
