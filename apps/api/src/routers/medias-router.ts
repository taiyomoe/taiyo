import { config } from "@taiyomoe/config"
import {
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  NewBanner,
  NewCover,
  STAFF_ROLES,
  sql,
} from "@taiyomoe/db"
import { extensionForMimeType } from "@taiyomoe/utils"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { pick } from "radashi"
import z from "zod"
import { checkImages } from "../middlewares/check-images-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingSchema,
  fileSchema,
  languageSchema,
} from "../utils/schemas"
import { uploadFile } from "../utils/upload-file"

const createMediaSchema = z.object({
  titles: z
    .object({
      title: z.string().meta({
        description: "The title of the media for the given language.",
        example: "One Punch Man",
      }),
      language: languageSchema("The language of the title."),
      main: z.boolean().default(false).meta({
        description: "Whether the title is the main title of the media.",
        example: false,
      }),
      priority: z
        .int()
        .min(1)
        .default(1)
        .meta({ description: "The priority of the title.", example: 1 }),
      isAcronym: z.boolean().default(false).meta({
        description: "Whether the title is an acronym.",
        example: false,
      }),
    })
    .array()
    .min(1)
    .meta({
      description:
        "The titles of the media. At least one title is required and exactly one main title is required.",
      examples: [
        {
          title: "One Punch Man",
          language: "en",
          main: true,
          priority: 1,
          isAcronym: false,
        },
        {
          title: "ワンパンマン",
          language: "ja",
          main: false,
          priority: 1,
          isAcronym: false,
        },
        {
          title: "One Punch-Man",
          language: "en",
          main: false,
          priority: 2,
          isAcronym: false,
        },
        {
          title: "OPM",
          language: "en",
          main: false,
          priority: 3,
          isAcronym: true,
        },
      ],
    })
    .refine((data) => data.filter((item) => item.main).length === 1, {
      message: "Exactly one title must be the main title.",
    }),
  covers: z
    .object({
      file: fileSchema("The file of the cover."),
      language: languageSchema("The language of the cover."),
      contentRating: contentRatingSchema("The content rating of the cover."),
      main: z.boolean().default(false).meta({
        description: "Whether the cover is the main cover of the media.",
        example: false,
      }),
      volume: z.number().min(1).optional().meta({
        description: "The volume of the cover.",
        example: 1,
      }),
    })
    .array()
    .min(1)
    .meta({
      description:
        "The covers of the media. At least one cover is required and exactly one main cover is required.",
      examples: [
        {
          file: "cover-1.jpg",
          language: "en",
          contentRating: "NORMAL",
          main: true,
          volume: 1,
        },
        {
          file: "cover-3.jpg",
          language: "ja",
          contentRating: "NORMAL",
          main: false,
          volume: 1,
        },
        {
          file: "cover-2.jpg",
          language: "en",
          contentRating: "SUGGESTIVE",
          main: false,
          volume: 2,
        },
      ],
    })
    .refine((data) => data.filter((item) => item.main).length === 1, {
      message: "Exactly one cover must be the main cover.",
    }),
  banners: z
    .object({
      file: fileSchema("The file of the banner."),
      contentRating: contentRatingSchema("The content rating of the banner."),
    })
    .array()
    .default([])
    .meta({
      description: "The banners of the media.",
      examples: [
        { file: "banner-1.jpg", contentRating: "NORMAL" },
        { file: "banner-2.jpg", contentRating: "SUGGESTIVE" },
      ],
    }),
  contentRating: contentRatingSchema("The content rating of the media."),
  type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media." }),
  status: z.enum(MEDIA_STATUSES).meta({
    description: "The current release status of the media.",
    example: "RELEASING",
  }),
  source: z.enum(MEDIA_SOURCES).meta({
    description: "The original source of the media.",
    example: "ORIGINAL",
  }),
  demography: z.enum(MEDIA_DEMOGRAPHIES).meta({
    description: "The target audience of the media.",
    example: "SHOUNEN",
  }),
  countryOfOrigin: z.enum(MEDIA_COUNTRIES_OF_ORIGIN).meta({
    description: "The country where the media was originally created.",
    example: "JAPAN",
  }),
  tags: z
    .object({
      key: z
        .enum(Object.keys(config.tags))
        .meta({ description: "The key of the tag.", example: "COWBOYS" }),
      isSpoiler: z
        .boolean()
        .default(false)
        .meta({ description: "Whether the tag is a spoiler.", example: false }),
    })
    .array()
    .default([])
    .meta({
      description: "List of tags that describe elements and themes of the media.",
      examples: [
        { key: "COWBOYS", isSpoiler: false },
        { key: "AWARD_WINNING", isSpoiler: false },
      ],
    }),
  links: z
    .object({
      mangaDex: z.uuid().optional().meta({ description: "MangaDex series UUID." }),
      anilist: z.int().positive().optional().meta({ description: "AniList numeric media ID." }),
      myAnimeList: z
        .int()
        .positive()
        .optional()
        .meta({ description: "MyAnimeList numeric media ID." }),
      animePlanet: z.url().optional().meta({ description: "Anime-Planet URL." }),
      bookWalker: z.url().optional().meta({ description: "BookWalker series URL." }),
      mangaUpdates: z.url().optional().meta({ description: "MangaUpdates series URL." }),
      novelUpdates: z.url().optional().meta({ description: "NovelUpdates series URL." }),
      kitsu: z.url().optional().meta({ description: "Kitsu manga URL." }),
      amazon: z.url().optional().meta({ description: "Amazon product URL." }),
      eBookJapan: z.url().optional().meta({ description: "eBookJapan product URL." }),
      raw: z.url().optional().meta({ description: "URL to the original raw publication." }),
      officialENTranslation: z
        .url()
        .optional()
        .meta({ description: "URL to the official English translation." }),
      officialFRTranslation: z
        .url()
        .optional()
        .meta({ description: "URL to the official French translation." }),
      officialPTBRTranslation: z
        .url()
        .optional()
        .meta({ description: "URL to the official Brazilian Portuguese translation." }),
      cdJapan: z.url().optional().meta({ description: "CDJapan product URL." }),
    })
    .default({})
    .meta({
      description: "External references for this media.",
      example: {
        mangaDex: "0ca1627e-95dd-4118-892a-f144adf02256",
        anilist: 31224,
        myAnimeList: 1224,
      },
    }),
  staffs: z
    .object({
      staffId: z
        .uuid()
        .meta({ description: "ID of an existing staff member.", example: crypto.randomUUID() }),
      role: z
        .enum(STAFF_ROLES)
        .meta({ description: "Their role for this media.", example: "AUTHOR" }),
    })
    .array()
    .default([])
    .meta({
      description:
        "Authors and artists attached to this media. Every `staffId` must already exist.",
    }),
})

export const mediasRouter = new Hono().post(
  "/",
  describeRoute({
    summary: "Create a new media",
    description:
      "Registers a media entry in a single multipart request, alongside its titles, covers, banners, tags, external links and staff credits.",
    tags: ["Medias"],
    requestBody: {
      content: {
        "multipart/form-data": await resolver(createMediaSchema).toOpenAPISchema(),
      },
    },
    responses: {
      201: {
        description: "Media created successfully",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the newly created media." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        409: "One or more of the provided links already belong to an existing media.",
        422: "The request data failed validation, an uploaded image is invalid, or a referenced staff member does not exist.",
      }),
    },
  }),
  withAuth("create", "Media"),
  validateFormData(createMediaSchema),
  checkImages(),
  withTransaction,
  async (c) => {
    const { db, s3, log } = c.var
    const body = c.var.formData!
    const mediaId = crypto.randomUUID()
    const links = Object.entries(body.links)

    log.set({ media: { id: mediaId } })

    /**
     * Block creation if any of the provided links already belong to another media.
     *
     * It probably means we're re-creating a media someone else already imported.
     */
    if (links.length > 0) {
      const existing = await db
        .selectFrom("medias")
        .select("id")
        .where((eb) =>
          eb.or(
            links.map(
              ([key, value]) => sql<boolean>`links @> ${JSON.stringify({ [key]: value })}::jsonb`,
            ),
          ),
        )
        .limit(1)
        .executeTakeFirst()

      if (existing) {
        return c.fail("MEDIA_LINK_CONFLICT", {
          conflictingMediaId: existing.id,
          providedLinks: Object.fromEntries(links),
        })
      }
    }

    if (body.staffs.length > 0) {
      const staffIds = Array.from(new Set(body.staffs.map((s) => s.staffId)))
      const found = await db.selectFrom("staffs").select("id").where("id", "in", staffIds).execute()
      const foundIds = new Set(found.map((row) => row.id))
      const missing = staffIds.filter((id) => !foundIds.has(id))

      if (missing.length > 0) {
        return c.fail("STAFF_NOT_FOUND", { missingStaffIds: missing })
      }
    }

    const media = await db
      .insertInto("medias")
      .values({
        id: mediaId,
        creatorId: c.var.user.id,
        links: Object.fromEntries(links),
        ...pick(body, [
          "type",
          "status",
          "source",
          "demography",
          "countryOfOrigin",
          "contentRating",
          "tags",
        ]),
      })
      .returningAll()
      .executeTakeFirst()

    log.set({ media })

    await db
      .insertInto("titles")
      .values(
        body.titles.map((title) => ({
          mediaId,
          creatorId: c.var.user.id,
          isMainTitle: title.main,
          ...pick(title, ["title", "language", "priority", "isAcronym"]),
        })),
      )
      .execute()

    if (body.staffs.length > 0) {
      await db
        .insertInto("staffOnMedias")
        .values(body.staffs.map((staff) => ({ mediaId, ...staff })))
        .execute()
    }

    const coverRows = await Promise.all(
      body.covers.map(async (cover) => {
        const id = crypto.randomUUID()

        await uploadFile(
          { s3, log },
          `covers/${id}.${extensionForMimeType(cover.file.type)}`,
          cover.file,
        )

        return {
          id,
          mediaId,
          volume: cover.volume !== undefined ? String(cover.volume) : null,
          language: cover.language,
          contentRating: cover.contentRating,
          isMainCover: cover.main,
          uploaderId: c.var.user.id,
        } satisfies NewCover
      }),
    )

    await db.insertInto("covers").values(coverRows).execute()

    if (body.banners.length > 0) {
      const bannerRows = await Promise.all(
        body.banners.map(async (banner) => {
          const id = crypto.randomUUID()

          await uploadFile(
            { s3, log },
            `banners/${id}.${extensionForMimeType(banner.file.type)}`,
            banner.file,
          )

          return {
            id,
            mediaId,
            contentRating: banner.contentRating,
            uploaderId: c.var.user.id,
          } satisfies NewBanner
        }),
      )

      await db.insertInto("banners").values(bannerRows).execute()
    }

    return c.ok({ id: mediaId })
  },
)
