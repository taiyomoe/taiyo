import { cacheClient } from "@taiyomoe/cache"
import {
  type ContentRating,
  type DB,
  type Kysely,
  LANGUAGES,
  MEDIA_TYPES,
  sql,
  USER_LIBRARY_STATUSES,
} from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getMainCoverUrls, getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"

const CACHE_TTL_SECONDS = 120
const ACTIVITY_DAYS = 365
const UPLOAD_MONTHS = 12
const TOP_MEDIAS = 6
const TOP_LANGUAGES = 6
const DAY_MS = 86_400_000
const querySchema = z.object({ contentRating: contentRatingsQuerySchema })
const readingSchema = z.object({
  chaptersRead: z.number().int(),
  mediasRead: z.number().int(),
  currentStreak: z
    .number()
    .int()
    .meta({ description: "Consecutive days with a read, up to today." }),
  longestStreak: z.number().int().meta({ description: "Longest run of consecutive reading days." }),
  activeDays: z.number().int().meta({ description: "Days with at least one read in the window." }),
  activity: z
    .object({ date: z.iso.date(), count: z.number().int() })
    .array()
    .meta({ description: `Chapters finished per UTC day over the last ${ACTIVITY_DAYS} days.` }),
  byType: z.object({ type: z.enum(MEDIA_TYPES), count: z.number().int() }).array(),
  byLanguage: z.object({ language: z.enum(LANGUAGES), count: z.number().int() }).array(),
  topMedias: z
    .object({
      id: z.uuid(),
      title: z.string().nullable(),
      coverUrl: z.url().nullable(),
      chapters: z.number().int(),
    })
    .array(),
})
const statsSchema = z.object({
  reading: readingSchema
    .nullable()
    .meta({ description: "Null when the user keeps their library private." }),
  library: z
    .object({
      total: z.number().int(),
      byStatus: z.record(z.enum(USER_LIBRARY_STATUSES), z.number().int()),
    })
    .nullable(),
  uploads: z.object({
    chapters: z.number().int(),
    medias: z.number().int(),
    languages: z.number().int(),
    firstAt: z.iso.datetime().nullable(),
    lastAt: z.iso.datetime().nullable(),
    monthly: z
      .object({ month: z.string().meta({ example: "2026-04" }), count: z.number().int() })
      .array()
      .meta({ description: `Published uploads per month over the last ${UPLOAD_MONTHS} months.` }),
  }),
})

type Stats = z.infer<typeof statsSchema>

const toDay = (date: Date) => date.toISOString().slice(0, 10)
const getStreaks = (days: string[]) => {
  const set = new Set(days)
  const sorted = [...set].sort()
  let longest = 0
  let run = 0
  let previous: number | null = null

  for (const day of sorted) {
    const time = Date.parse(day)

    run = previous !== null && time - previous === DAY_MS ? run + 1 : 1
    longest = Math.max(longest, run)
    previous = time
  }

  const today = Date.parse(toDay(new Date()))
  // A streak survives until the end of the day after its last read.
  let cursor = set.has(toDay(new Date(today))) ? today : today - DAY_MS
  let current = 0

  while (set.has(toDay(new Date(cursor)))) {
    current += 1
    cursor -= DAY_MS
  }

  return { currentStreak: current, longestStreak: longest }
}
const getReading = async (db: Kysely<DB>, userId: string, contentRatings: ContentRating[]) => {
  const completed = db
    .selectFrom("userHistories")
    .innerJoin("chapters", "chapters.id", "userHistories.chapterId")
    .innerJoin("medias", "medias.id", "chapters.mediaId")
    .where("userHistories.userId", "=", userId)
    .where("userHistories.completed", "=", true)
  const since = new Date(Date.now() - ACTIVITY_DAYS * DAY_MS)
  const [totals, activity, byType, byLanguage, top] = await Promise.all([
    completed
      .select((eb) => [
        eb.fn.countAll<string>().as("chapters"),
        eb.fn.count<string>("chapters.mediaId").distinct().as("medias"),
      ])
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("userHistories")
      .where("userId", "=", userId)
      .where("completed", "=", true)
      .where("updatedAt", ">=", since)
      .select((eb) => [
        sql<string>`to_char(date_trunc('day', "updatedAt"), 'YYYY-MM-DD')`.as("date"),
        eb.fn.countAll<string>().as("count"),
      ])
      .groupBy("date")
      .orderBy("date", "asc")
      .execute(),
    completed
      .select((eb) => ["medias.type", eb.fn.count<string>("medias.id").distinct().as("count")])
      .groupBy("medias.type")
      .orderBy("count", "desc")
      .execute(),
    completed
      .select((eb) => ["chapters.language", eb.fn.countAll<string>().as("count")])
      .groupBy("chapters.language")
      .orderBy("count", "desc")
      .limit(TOP_LANGUAGES)
      .execute(),
    completed
      .where("medias.deletedAt", "is", null)
      .where("medias.contentRating", "in", contentRatings)
      .select((eb) => ["medias.id", eb.fn.countAll<string>().as("count")])
      .groupBy("medias.id")
      .orderBy("count", "desc")
      .orderBy("medias.id", "asc")
      .limit(TOP_MEDIAS)
      .execute(),
  ])
  const topIds = top.map((row) => row.id)
  const [titles, covers] = await Promise.all([
    getMainTitles(db, topIds),
    getMainCoverUrls(db, topIds),
  ])

  return {
    chaptersRead: Number(totals.chapters),
    mediasRead: Number(totals.medias),
    ...getStreaks(activity.map((row) => row.date)),
    activeDays: activity.length,
    activity: activity.map((row) => ({ date: row.date, count: Number(row.count) })),
    byType: byType.map((row) => ({ type: row.type, count: Number(row.count) })),
    byLanguage: byLanguage.map((row) => ({ language: row.language, count: Number(row.count) })),
    topMedias: top.map((row) => ({
      id: row.id,
      title: titles.get(row.id) ?? null,
      coverUrl: covers.get(row.id) ?? null,
      chapters: Number(row.count),
    })),
  } satisfies Stats["reading"]
}
const getLibrary = async (db: Kysely<DB>, userId: string) => {
  const rows = await db
    .selectFrom("userLibraryEntries")
    .innerJoin("medias", "medias.id", "userLibraryEntries.mediaId")
    .where("userLibraryEntries.userId", "=", userId)
    .where("medias.deletedAt", "is", null)
    .select((eb) => ["userLibraryEntries.status", eb.fn.countAll<string>().as("count")])
    .groupBy("userLibraryEntries.status")
    .execute()
  const countOf = (status: (typeof USER_LIBRARY_STATUSES)[number]) =>
    Number(rows.find((row) => row.status === status)?.count ?? 0)
  const byStatus = {
    READING: countOf("READING"),
    REREADING: countOf("REREADING"),
    PLAN_TO_READ: countOf("PLAN_TO_READ"),
    COMPLETED: countOf("COMPLETED"),
    ON_HOLD: countOf("ON_HOLD"),
    DROPPED: countOf("DROPPED"),
  }

  return {
    total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
    byStatus,
  } satisfies Stats["library"]
}
const getUploads = async (db: Kysely<DB>, userId: string) => {
  const published = db
    .selectFrom("chapters")
    .innerJoin("medias", "medias.id", "chapters.mediaId")
    .where("chapters.uploaderId", "=", userId)
    .where("chapters.deletedAt", "is", null)
    .where("chapters.status", "=", "PUBLISHED")
    .where("medias.deletedAt", "is", null)
  const since = new Date()

  since.setUTCDate(1)
  since.setUTCHours(0, 0, 0, 0)
  since.setUTCMonth(since.getUTCMonth() - (UPLOAD_MONTHS - 1))

  const [totals, monthly] = await Promise.all([
    published
      .select((eb) => [
        eb.fn.countAll<string>().as("chapters"),
        eb.fn.count<string>("chapters.mediaId").distinct().as("medias"),
        eb.fn.count<string>("chapters.language").distinct().as("languages"),
        sql<
          string | null
        >`to_char(min("chapters"."createdAt"), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as("firstAt"),
        sql<
          string | null
        >`to_char(max("chapters"."createdAt"), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as("lastAt"),
      ])
      .executeTakeFirstOrThrow(),
    published
      .where("chapters.createdAt", ">=", since)
      .select((eb) => [
        sql<string>`to_char(date_trunc('month', "chapters"."createdAt"), 'YYYY-MM')`.as("month"),
        eb.fn.countAll<string>().as("count"),
      ])
      .groupBy("month")
      .execute(),
  ])
  const counts = new Map(monthly.map((row) => [row.month, Number(row.count)]))

  return {
    chapters: Number(totals.chapters),
    medias: Number(totals.medias),
    languages: Number(totals.languages),
    firstAt: totals.firstAt,
    lastAt: totals.lastAt,
    monthly: Array.from({ length: UPLOAD_MONTHS }, (_, index) => {
      const month = new Date(since)

      month.setUTCMonth(since.getUTCMonth() + index)

      const key = month.toISOString().slice(0, 7)

      return { month: key, count: counts.get(key) ?? 0 }
    }),
  } satisfies Stats["uploads"]
}

export const getUserStatsHandler = new Hono().get(
  "/:id/stats",
  describeRoute({
    summary: "Get a user's stats",
    description: `Reading, library and upload statistics of a user. Reading and library stats are null when the user hides their library, unless you are that user. Results are cached for ${CACHE_TTL_SECONDS / 60} minutes.\n\n**Authentication:** optional.`,
    tags: ["Users"],
    responses: {
      200: {
        description: "The user's stats.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(statsSchema)) } },
      },
      ...getOpenApiResponses({
        404: "No user with the given id exists.",
        422: "The provided id is not a valid UUID or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkUser(),
  withOptionalAuth,
  async (c) => {
    const { db, targetUser, viewer, cacheNamespace } = c.var
    const { contentRating } = c.var.query
    const visible = targetUser.settings.showLibrary !== false || viewer?.id === targetUser.id
    const cacheKey = `${cacheNamespace}${targetUser.id}:${visible ? "all" : "public"}:${contentRating.join(",")}`
    const cached = await cacheClient.users.stats.get<Stats>(cacheKey)

    if (cached) {
      return c.ok(cached)
    }

    const [reading, library, uploads] = await Promise.all([
      visible ? getReading(db, targetUser.id, contentRating) : null,
      visible ? getLibrary(db, targetUser.id) : null,
      getUploads(db, targetUser.id),
    ])
    const stats = { reading, library, uploads } satisfies Stats

    await cacheClient.users.stats.set(cacheKey, stats, CACHE_TTL_SECONDS)

    return c.ok(stats)
  },
)
