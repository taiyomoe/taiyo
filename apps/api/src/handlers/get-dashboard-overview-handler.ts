import { cacheClient } from "@taiyomoe/cache"
import { MEDIA_TYPES, sql } from "@taiyomoe/db"
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
  getWindowedOverview,
  type WindowedOverview,
} from "../utils/dashboard-overview"
import { getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  storedLanguageSchema,
  timeZoneSchema,
  userSummarySchema,
} from "../utils/schemas"

const CACHE_TTL_SECONDS: Record<DashboardRange, number> = {
  "24h": 60,
  "7d": 300,
  "30d": 300,
  "90d": 900,
  "12m": 900,
}
const inFlight = new Map<string, Promise<WindowedOverview>>()
const RECENT_ACTIVITY_ROWS = 100
const recentSince = (table: "chapters" | "covers" | "medias") =>
  sql<string>`coalesce((select date_trunc('hour', ${sql.ref(`${table}.createdAt`)}) from ${sql.table(table)} order by ${sql.ref(`${table}.createdAt`)} desc offset ${sql.lit(RECENT_ACTIVITY_ROWS - 1)} limit 1), '-infinity')::text`

type DashboardActivityKind = (typeof DASHBOARD_ACTIVITY_KINDS)[number]

const querySchema = z.object({
  range: z.enum(DASHBOARD_RANGES).default("30d").meta({
    description:
      "The period to report on: 24 hourly, 7 or 30 daily, 13 weekly or 12 monthly buckets. Defaults to `30d`.",
    example: "30d",
  }),
  tz: timeZoneSchema.meta({
    description: "The IANA time zone the buckets and reading hours follow. Defaults to `UTC`.",
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
  metrics: z
    .object({
      reads: metricSchema.meta({
        description: "The number of chapters opened for the first time by signed-in users.",
      }),
      uniqueReaders: metricSchema.meta({
        description:
          "The number of distinct users who opened a chapter for the first time. Totals count each user once over the whole window.",
      }),
      libraryAdds: metricSchema.meta({
        description: "The number of medias added to a library.",
      }),
      chaptersUploaded: metricSchema.meta({
        description: "The number of chapters uploaded that are published and not deleted.",
      }),
      newAccounts: metricSchema.meta({ description: "The number of accounts created." }),
    })
    .meta({ description: "The activity metrics, each with its current and previous window." }),
  readsByLanguage: z
    .object({
      language: storedLanguageSchema("The language of the chapters read."),
      reads: z.int().meta({
        description: "The number of reads in the current window.",
        example: 940,
      }),
    })
    .array()
    .meta({ description: "The five most read languages in the current window, most read first." }),
  otherLanguageReads: z.int().meta({
    description: "The number of reads of every other language in the current window.",
    example: 120,
  }),
  topMedias: z
    .object({
      id: z.uuid().meta({ description: "The ID of the media." }),
      title: z
        .string()
        .nullable()
        .meta({ description: "The main title of the media, if any.", example: "Chainsaw Man" }),
      coverUrl: z
        .url()
        .nullable()
        .meta({ description: "The URL of the media's main cover, if any." }),
      reads: z.int().meta({
        description: "The number of reads in the current window.",
        example: 310,
      }),
    })
    .array()
    .meta({ description: "The eight most read medias in the current window, most read first." }),
  readingHours: z.int().array().array().meta({
    description:
      "The number of reads in the current window by local weekday (rows, Monday first) and local hour (columns, 0-23).",
  }),
  topUploaders: userSummarySchema
    .extend({
      chapters: z.int().meta({
        description:
          "The number of chapters the user uploaded in the current window that are published and not deleted.",
        example: 42,
      }),
      previousChapters: z.int().meta({
        description:
          "The number of chapters the user uploaded in the previous window that are published and not deleted.",
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
      count: z.int().meta({ description: "The number of medias of this type.", example: 412 }),
    })
    .array()
    .meta({ description: "Every media type with its number of medias, all time." }),
  attention: z
    .object({
      failedUploads: z.int().meta({
        description: "The number of chapter uploads that failed.",
        example: 1,
      }),
    })
    .meta({ description: "The work waiting on a moderator." }),
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
          "The number of events the item groups. Uploads of one kind by one user to one media within the same hour are grouped.",
        example: 3,
      }),
      actor: userSummarySchema.meta({ description: "The user behind the activity." }),
      media: z
        .object({
          id: z.uuid().meta({ description: "The ID of the media." }),
          title: z
            .string()
            .nullable()
            .meta({ description: "The main title of the media, if any.", example: "Chainsaw Man" }),
        })
        .meta({ description: "The media the activity happened on." }),
    })
    .array()
    .meta({
      description: "The six latest chapter and cover uploads and media creations, newest first.",
    }),
})

export const getDashboardOverviewHandler = new Hono().get(
  "/overview",
  describeRoute({
    summary: "Get the dashboard overview",
    description:
      "Returns the activity metrics bucketed over the requested range and compared with the period before it, plus reading breakdowns, the catalog mix, pending moderation work and the latest uploads. The range-dependent figures can be up to one minute (`24h`), five minutes (`7d`, `30d`) or fifteen minutes (`90d`, `12m`) old; the catalog mix, pending work and latest uploads are always current.\n\n**Required roles:** moderator, admin.",
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
        401: true,
        403: true,
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
      cacheClient.dashboard.overview.get<WindowedOverview>(cacheKey).then((cached) => {
        if (cached) {
          return cached
        }

        const pending =
          inFlight.get(cacheKey) ??
          getWindowedOverview(db, range, tz)
            .then(async (fresh) => {
              await cacheClient.dashboard.overview.set(cacheKey, fresh, CACHE_TTL_SECONDS[range])

              return fresh
            })
            .finally(() => {
              inFlight.delete(cacheKey)
            })

        inFlight.set(cacheKey, pending)

        return pending
      }),
      db
        .selectFrom("medias")
        .where("medias.deletedAt", "is", null)
        .select((eb) => ["medias.type", eb.fn.countAll<string>().as("count")])
        .groupBy("medias.type")
        .execute()
        .then((rows) => {
          const counts = new Map(rows.map((row) => [row.type, Number(row.count)]))

          return MEDIA_TYPES.map((type) => ({ type, count: counts.get(type) ?? 0 }))
        }),
      db
        .selectNoFrom((eb) => [
          eb
            .selectFrom("tasks")
            .where("tasks.status", "=", "FAILED")
            .select((e) => e.fn.countAll<string>().as("count"))
            .as("failedUploads"),
        ])
        .executeTakeFirstOrThrow()
        .then((row) => ({
          failedUploads: Number(row.failedUploads),
        })),
      db
        .selectNoFrom([
          recentSince("chapters").as("chapters"),
          recentSince("covers").as("covers"),
          recentSince("medias").as("medias"),
        ])
        .executeTakeFirstOrThrow()
        .then(async (since) => {
          const events = db
            .selectFrom("chapters")
            .where("chapters.deletedAt", "is", null)
            .where("chapters.status", "=", "PUBLISHED")
            .where("chapters.createdAt", ">=", sql<Date>`${since.chapters}::timestamp`)
            .select([
              sql.lit<DashboardActivityKind>("CHAPTERS_UPLOADED").as("kind"),
              "chapters.uploaderId as actorId",
              "chapters.mediaId",
              "chapters.createdAt",
            ])
            .unionAll(
              db
                .selectFrom("covers")
                .where("covers.deletedAt", "is", null)
                .where("covers.createdAt", ">=", sql<Date>`${since.covers}::timestamp`)
                .select([
                  sql.lit<DashboardActivityKind>("COVERS_UPLOADED").as("kind"),
                  "covers.uploaderId as actorId",
                  "covers.mediaId",
                  "covers.createdAt",
                ]),
            )
            .unionAll(
              db
                .selectFrom("medias")
                .where("medias.createdAt", ">=", sql<Date>`${since.medias}::timestamp`)
                .select([
                  sql.lit<DashboardActivityKind>("MEDIA_CREATED").as("kind"),
                  "medias.creatorId as actorId",
                  "medias.id as mediaId",
                  "medias.createdAt",
                ]),
            )
          const rows = await db
            .selectFrom(events.as("event"))
            .innerJoin("medias", "medias.id", "event.mediaId")
            .innerJoin("users", "users.id", "event.actorId")
            .where("medias.deletedAt", "is", null)
            .select((eb) => [
              "event.kind",
              "event.mediaId",
              "users.id as actorId",
              "users.username as actorUsername",
              "users.displayUsername as actorDisplayUsername",
              "users.image as actorImage",
              "users.nameEffect as actorNameEffect",
              "users.avatarBorder as actorAvatarBorder",
              sql<Date>`max(${eb.ref("event.createdAt")}) at time zone 'UTC'`.as("at"),
              eb.fn.countAll<string>().as("count"),
            ])
            .groupBy([
              "event.kind",
              "users.id",
              "event.mediaId",
              sql`date_trunc('hour', ${sql.ref("event.createdAt")})`,
            ])
            .orderBy("at", "desc")
            .limit(6)
            .execute()
          const titles = await getMainTitles(
            db,
            rows.map((row) => row.mediaId),
          )

          return rows.map((row) => ({
            kind: row.kind,
            at: row.at,
            count: Number(row.count),
            actor: {
              id: row.actorId,
              username: row.actorUsername,
              displayUsername: row.actorDisplayUsername,
              image: row.actorImage,
              nameEffect: row.actorNameEffect,
              avatarBorder: row.actorAvatarBorder,
            },
            media: { id: row.mediaId, title: titles.get(row.mediaId) ?? null },
          }))
        }),
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
