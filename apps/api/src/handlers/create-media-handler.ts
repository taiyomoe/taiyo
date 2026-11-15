import { mediaAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import {
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  type NewBanner,
  type NewCover,
  STAFF_ROLES,
  sql,
} from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { pick } from "radashi"
import z from "zod"
import { putImage } from "../image-store"
import { audited } from "../middlewares/audited-middleware"
import { checkImages } from "../middlewares/check-images-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { transcodeSlot } from "../middlewares/transcode-slot-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingSchema,
  fileSchema,
  mediaLanguageSchema,
  mediaLinksSchema,
  mediaSynopsisSchema,
  mediaTagsSchema,
} from "../utils/schemas"

const createMediaSchema = z.object({
  titles: z
    .object({
      title: z.string().min(1).max(config.input.maxNameLength).meta({
        description: "The title of the media in the given language.",
        example: "One Punch Man",
      }),
      language: mediaLanguageSchema("The language of the title."),
      main: z.boolean().default(false).meta({
        description: "Whether the title is the main title of the media.",
        example: false,
      }),
      priority: z.int().min(1).default(1).meta({
        description: "The rank of the title among the titles of its language, 1 first.",
        example: 1,
      }),
      isAcronym: z.boolean().default(false).meta({
        description: "Whether the title is an acronym.",
        example: false,
      }),
    })
    .array()
    .min(1)
    .meta({
      description: "The titles of the media. Exactly one of them must be the main title.",
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
      file: fileSchema("The image of the cover."),
      language: mediaLanguageSchema("The language of the cover."),
      contentRating: contentRatingSchema("The content rating of the cover."),
      main: z.boolean().default(false).meta({
        description: "Whether the cover is the main cover of the media.",
        example: false,
      }),
      volume: z.number().min(1).optional().meta({
        description: "The volume the cover belongs to.",
        example: 1,
      }),
    })
    .array()
    .min(1)
    .meta({
      description: "The covers of the media. Exactly one of them must be the main cover.",
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
      file: fileSchema("The image of the banner."),
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
  synopsis: mediaSynopsisSchema.default({}),
  startDate: z.iso
    .datetime()
    .optional()
    .meta({
      description: "When the media started releasing, if known.",
      example: "2009-06-03T00:00:00.000Z",
    }),
  endDate: z.iso
    .datetime()
    .optional()
    .meta({
      description: "When the media finished releasing, if it did.",
      example: "2023-11-27T00:00:00.000Z",
    }),
  contentRating: contentRatingSchema("The content rating of the media."),
  type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media.", example: "MANGA" }),
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
  tags: mediaTagsSchema.default([]),
  links: mediaLinksSchema.default({}),
  staffs: z
    .object({
      staffId: z.uuid().meta({
        description: "The ID of the staff.",
        example: "6f1d3c2b-8a4e-4f7a-9c1d-2e5b7a9c0d34",
      }),
      role: z
        .enum(STAFF_ROLES)
        .meta({ description: "The role of the staff on the media.", example: "AUTHOR" }),
    })
    .array()
    .default([])
    .meta({
      description: "The staff credits of the media, such as its authors and artists.",
    }),
})

export const createMediaHandler = new Hono().post(
  "/",
  describeRoute({
    summary: "Create a media",
    description:
      "Creates a media with its titles, synopsis, release dates, covers, banners, tags, links and staff credits.\n\n**Required roles:** uploader intern, uploader, admin.",
    tags: ["Medias"],
    responses: {
      201: {
        description: "Media created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the new media." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "One of the staff members does not exist.",
        409: "One of the links already belongs to another media.",
        422: `The request body failed validation, or one of the images is invalid, larger than ${config.images.maxSizeBytes / 1024 / 1024} MB or has too many pixels or frames.`,
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(mediaAudit.CREATE),
  withAuth("media.create"),
  rateLimit({ prefix: "create-media", windowMs: 60_000, limit: 10 }),
  validateFormData(createMediaSchema),
  checkImages(),
  transcodeSlot,
  withTransaction,
  async (c) => {
    const { db, log } = c.var
    const body = c.var.formData
    const mediaId = crypto.randomUUID()
    const links = Object.entries(body.links)

    log.set({ media: { id: mediaId } })

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
      const found = await db
        .selectFrom("staffs")
        .select("id")
        .where("id", "in", staffIds)
        .where("deletedAt", "is", null)
        .execute()
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
        synopsis: Object.fromEntries(
          Object.entries(body.synopsis).filter(([, text]) => text.trim() !== ""),
        ),
        startDate: body.startDate === undefined ? null : new Date(body.startDate),
        endDate: body.endDate === undefined ? null : new Date(body.endDate),
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
        .insertInto("mediaStaffs")
        .values(body.staffs.map((staff) => ({ mediaId, ...staff })))
        .onConflict((oc) => oc.doNothing())
        .execute()
    }

    const coverRows = await Promise.all(
      body.covers.map(async (cover) => {
        const id = crypto.randomUUID()
        const { extension } = await putImage(c.var, { kind: "cover", mediaId, id }, cover.file)

        return {
          id,
          mediaId,
          extension,
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
          const { extension } = await putImage(c.var, { kind: "banner", mediaId, id }, banner.file)

          return {
            id,
            mediaId,
            extension,
            contentRating: banner.contentRating,
            uploaderId: c.var.user.id,
          } satisfies NewBanner
        }),
      )

      await db.insertInto("banners").values(bannerRows).execute()
    }

    c.var.audit.set({
      target: { id: mediaId, title: body.titles.find((title) => title.main)?.title },
    })

    return c.ok({ id: mediaId })
  },
)
