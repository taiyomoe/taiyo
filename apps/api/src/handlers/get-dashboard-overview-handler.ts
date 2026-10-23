import { cacheClient } from "@taiyomoe/cache"
import { type DB, type Kysely, MEDIA_TYPES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import {
  DASHBOARD_ACTIVITY_KINDS,
  DASHBOARD_RANGES,
  DASHBOARD_UNITS,
  type DashboardRange,
  getAttention,
  getCatalogMix,
  getRecentActivity,
  getWindowedOverview,
  type WindowedOverview,
} from "../utils/dashboard-overview"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, languageSchema } from "../utils/schemas"

const TIME_ZONES = new Set(["UTC", ...Intl.supportedValuesOf("timeZone")])
const canonicalTimeZone = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en", { timeZone: value }).resolvedOptions().timeZone
  } catch {
    return value
  }
}
const CACHE_TTL_SECONDS: Record<DashboardRange, number> = {
  "24h": 60,
  "7d": 300,
  "30d": 300,
  "90d": 900,
  "12m": 900,
}
const inFlight = new Map<string, Promise<WindowedOverview>>()
const computeWindowedOverview = async (
  db: Kysely<DB>,
  range: DashboardRange,
  timeZone: string,
  cacheKey: string,
) => {
  const windowed = await getWindowedOverview(db, range, timeZone)

  await cacheClient.dashboard.overview.set(cacheKey, windowed, CACHE_TTL_SECONDS[range])

  return windowed
}
const getCachedWindowedOverview = async (
  db: Kysely<DB>,
  range: DashboardRange,
  timeZone: string,
  cacheKey: string,
) => {
  const cached = await cacheClient.dashboard.overview.get<WindowedOverview>(cacheKey)

  if (cached) {
    return cached
  }

  const pending =
    inFlight.get(cacheKey) ??
    computeWindowedOverview(db, range, timeZone, cacheKey).finally(() => {
      inFlight.delete(cacheKey)
    })

  inFlight.set(cacheKey, pending)

  return pending
}
const querySchema = z.object({
  range: z.enum(DASHBOARD_RANGES).default("30d").meta({
    description:
      "The period to report on: 24 hourly, 7 or 30 daily, 13 weekly or 12 monthly buckets. Default: 30d.",
    example: "30d",
  }),
  tz: z
    .string()
    .transform(canonicalTimeZone)
    .refine((value) => TIME_ZONES.has(value), "Unknown time zone.")
    .default("UTC")
    .meta({
      description: "IANA time zone the buckets and reading hours follow. Default: UTC.",
      example: "America/Sao_Paulo",
    }),
})
const metricSchema = z.object({
  total: z.int().meta({ description: "The total over the current window.", example: 1280 }),
  previousTotal: z
    .int()
    .meta({ description: "The total over the previous window.", example: 1104 }),
  current: z
    .int()
    .array()
    .meta({
      description: "The value of each current bucket, aligned with `buckets`.",
      example: [41, 38, 52],
    }),
  previous: z
    .int()
    .array()
    .meta({
      description:
        "The value of each bucket one period earlier, aligned with `current`. The last one stops at the same elapsed point as the current bucket.",
      example: [35, 40, 47],
    }),
})
const dashboardOverviewSchema = z.object({
  range: z.enum(DASHBOARD_RANGES).meta({ description: "The requested range.", example: "30d" }),
  unit: z.enum(DASHBOARD_UNITS).meta({ description: "The size of each bucket.", example: "day" }),
  timeZone: z.string().meta({
    description: "The canonical name of the time zone used for bucketing.",
    example: "America/Sao_Paulo",
  }),
  buckets: z.iso
    .datetime()
    .array()
    .meta({
      description: "The start of each current bucket, oldest first.",
      example: ["2026-09-15T03:00:00.000Z", "2026-09-16T03:00:00.000Z"],
    }),
  metrics: z.object({
    reads: metricSchema.meta({
      description: "Chapters opened for the first time by signed-in users.",
    }),
    uniqueReaders: metricSchema.meta({
      description:
        "Distinct users who opened a chapter for the first time. Totals are distinct over the whole window.",
    }),
    libraryAdds: metricSchema.meta({ description: "Medias added to a library." }),
    chaptersUploaded: metricSchema.meta({ description: "Chapters uploaded and not deleted." }),
    newAccounts: metricSchema.meta({ description: "Accounts created." }),
  }),
  readsByLanguage: z
    .object({
      language: languageSchema("The language of the chapters read."),
      reads: z.int().meta({ description: "Reads in the current window.", example: 940 }),
    })
    .array()
    .meta({ description: "The five most read languages in the current window, most read first." }),
  otherLanguageReads: z.int().meta({
    description: "Reads of every other language in the current window.",
    example: 120,
  }),
  topMedias: z
    .object({
      id: z.uuid().meta({ description: "The ID of the media." }),
      title: z.string().nullable().meta({ description: "The main title of the media." }),
      coverUrl: z.url().nullable().meta({ description: "URL of the media's main cover, if any." }),
      reads: z.int().meta({ description: "Reads in the current window.", example: 310 }),
    })
    .array()
    .meta({ description: "The eight most read medias in the current window, most read first." }),
  readingHours: z.int().array().array().meta({
    description:
      "Reads in the current window by local weekday (rows, Monday first) and local hour (columns, 0-23).",
  }),
  topUploaders: z
    .object({
      id: z.uuid().meta({ description: "The ID of the user." }),
      username: z.string().meta({ description: "The username of the user.", example: "kaito" }),
      displayUsername: z
        .string()
        .meta({ description: "The display name of the user.", example: "Kaito" }),
      image: z.string().nullable().meta({ description: "URL of the user's avatar, if any." }),
      chapters: z.int().meta({
        description: "Chapters the user uploaded in the current window, not deleted.",
        example: 42,
      }),
      previousChapters: z.int().meta({
        description: "Chapters the user uploaded in the previous window, not deleted.",
        example: 35,
      }),
    })
    .array()
    .meta({
      description:
        "The eight users who uploaded the most chapters in the current window, most first, then by display name.",
    }),
  catalogMix: z
    .object({
      type: z.enum(MEDIA_TYPES).meta({ description: "The media type.", example: "MANGA" }),
      count: z.int().meta({ description: "How many medias have this type.", example: 412 }),
    })
    .array()
    .meta({ description: "Every media type with its number of medias, all time." }),
  attention: z
    .object({
      pendingOwnershipRequests: z.int().meta({
        description: "Group ownership requests awaiting review.",
        example: 3,
      }),
      failedUploads: z.int().meta({ description: "Chapter uploads that failed.", example: 1 }),
    })
    .meta({ description: "Things waiting on a moderator." }),
  recentActivity: z
    .object({
      kind: z
        .enum(DASHBOARD_ACTIVITY_KINDS)
        .meta({ description: "What happened.", example: "CHAPTERS_UPLOADED" }),
      at: z.iso.datetime().meta({
        description: "When the latest event of the item happened.",
        example: "2026-10-13T21:42:10.118Z",
      }),
      count: z.int().meta({
        description:
          "How many events the item groups. Uploads by one user to one media within the same hour are grouped.",
        example: 3,
      }),
      actor: z
        .object({
          id: z.uuid().meta({ description: "The ID of the user." }),
          username: z.string().meta({ description: "The username of the user.", example: "kaito" }),
          displayUsername: z
            .string()
            .meta({ description: "The display name of the user.", example: "Kaito" }),
          image: z.string().nullable().meta({ description: "URL of the user's avatar, if any." }),
        })
        .meta({ description: "The user behind the activity." }),
      media: z
        .object({
          id: z.uuid().meta({ description: "The ID of the media." }),
          title: z.string().nullable().meta({ description: "The main title of the media." }),
        })
        .meta({ description: "The media the activity happened on." }),
    })
    .array()
    .meta({ description: "The six latest uploads and media creations, newest first." }),
})

export const getDashboardOverviewHandler = new Hono().get(
  "/overview",
  describeRoute({
    summary: "Get the dashboard overview",
    description:
      "Activity metrics bucketed over the requested range and compared with the period before it, plus reading breakdowns, the catalog mix, pending moderation work and the latest uploads. The range-dependent part is cached per range and time zone for one minute (24h), five minutes (7d, 30d) or fifteen minutes (90d, 12m); the catalog mix, pending work and latest uploads are always live.\n\n**Authentication:** moderator or admin.",
    tags: ["Dashboard"],
    responses: {
      200: {
        description: "The dashboard overview.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(dashboardOverviewSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("dashboard.viewStats"),
  validateQuery(querySchema),
  async (c) => {
    const { db, cacheNamespace } = c.var
    const { range, tz } = c.var.query
    const cacheKey = `${cacheNamespace}${range}:${tz}`
    const [windowed, catalogMix, attention, recentActivity] = await Promise.all([
      getCachedWindowedOverview(db, range, tz, cacheKey),
      getCatalogMix(db),
      getAttention(db),
      getRecentActivity(db),
    ])

    return c.ok({
      range,
      unit: windowed.unit,
      timeZone: tz,
      buckets: windowed.buckets,
      metrics: windowed.metrics,
      readsByLanguage: windowed.readsByLanguage,
      otherLanguageReads: windowed.otherLanguageReads,
      topMedias: windowed.topMedias,
      readingHours: windowed.readingHours,
      topUploaders: windowed.topUploaders,
      catalogMix,
      attention,
      recentActivity,
    })
  },
)
