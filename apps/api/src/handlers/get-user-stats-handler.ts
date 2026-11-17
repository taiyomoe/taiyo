import { cacheClient } from "@taiyomoe/cache"
import { tags } from "@taiyomoe/config"
import {
  type ContentRating,
  type DB,
  type Kysely,
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
import { countLibraryEntries } from "../utils/library"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  storedLanguageSchema,
} from "../utils/schemas"

const CACHE_TTL_SECONDS = 120
const ACTIVITY_DAYS = 365
const UPLOAD_MONTHS = 12
const TOP_MEDIAS = 6
const TOP_LANGUAGES = 6
const DAY_MS = 86_400_000
const GENRE_KEYS = Object.entries(tags)
  .filter(([, tag]) => tag.category === "Genre")
  .map(([key]) => key)
const querySchema = z.object({
  contentRating: contentRatingsQuerySchema.meta({
    description:
      "Comma-separated content ratings of the media to count in the reading stats, except the streaks. Defaults to the default user setting.",
  }),
})
const countField = (description: string, example: number) => z.int().meta({ description, example })
const readingSchema = z.object({
  chaptersRead: countField("The number of chapters the user finished.", 1342),
  mediasRead: countField("The number of media the user finished at least one chapter of.", 58),
  currentStreak: countField(
    "The number of consecutive days, up to today or yesterday, on which the user finished a chapter.",
    6,
  ),
  longestStreak: countField(
    `The longest run of consecutive days on which the user finished a chapter, over the last ${ACTIVITY_DAYS} days.`,
    21,
  ),
  genres: z
    .object({
      genre: z.string().meta({ description: "The key of the genre tag.", example: "ACTION" }),
      count: countField("The number of media with the genre the user read.", 23),
    })
    .array()
    .meta({ description: "The number of media read per genre, most read first." }),
  byType: z
    .object({
      type: z.enum(MEDIA_TYPES).meta({ description: "The type of media.", example: "MANGA" }),
      count: countField("The number of media of the type the user read.", 41),
    })
    .array()
    .meta({ description: "The number of media read per type, most read first." }),
  byLanguage: z
    .object({
      language: storedLanguageSchema("The language of the chapters."),
      count: countField("The number of chapters in the language the user finished.", 980),
    })
    .array()
    .meta({
      description: `The number of chapters finished per language, most read first, for the top ${TOP_LANGUAGES} languages.`,
    }),
  topMedias: z
    .object({
      id: z.uuid().meta({ description: "The ID of the media." }),
      title: z
        .string()
        .nullable()
        .meta({ description: "The main title of the media.", example: "Vagabond" }),
      coverUrl: z
        .url()
        .nullable()
        .meta({ description: "The URL of the media's main cover, if any." }),
      chapters: countField("The number of chapters of the media the user finished.", 327),
    })
    .array()
    .meta({
      description: `The ${TOP_MEDIAS} media the user finished the most chapters of, most read first.`,
    }),
})
const statsSchema = z.object({
  reading: readingSchema.nullable().meta({
    description:
      "The reading stats of the user, or null when the user hides their library from you.",
  }),
  library: z
    .object({
      total: countField("The number of media in the user's library.", 74),
      byStatus: z
        .record(z.enum(USER_LIBRARY_STATUSES), z.int())
        .meta({ description: "The number of media in the user's library per reading status." }),
    })
    .nullable()
    .meta({
      description:
        "The library stats of the user, or null when the user hides their library from you.",
    }),
  uploads: z
    .object({
      chapters: countField("The number of published chapters the user uploaded.", 214),
      medias: countField("The number of media the user uploaded published chapters to.", 9),
      languages: countField("The number of languages the user uploaded published chapters in.", 2),
      firstAt: z.iso
        .datetime()
        .nullable()
        .meta({ description: "When the user's first published chapter was uploaded, if any." }),
      lastAt: z.iso
        .datetime()
        .nullable()
        .meta({ description: "When the user's latest published chapter was uploaded, if any." }),
      monthly: z
        .object({
          month: z.string().meta({ description: "The month, as YYYY-MM.", example: "2026-04" }),
          count: countField("The number of published chapters the user uploaded that month.", 18),
        })
        .array()
        .meta({
          description: `The number of published chapters uploaded per month over the last ${UPLOAD_MONTHS} months, oldest first.`,
        }),
    })
    .meta({ description: "The upload stats of the user." }),
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
    .where("medias.deletedAt", "is", null)
    .where("medias.contentRating", "in", contentRatings)
  const since = new Date(Date.now() - ACTIVITY_DAYS * DAY_MS)
  const [totals, activity, byType, byLanguage, top, genres] = await Promise.all([
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
      .select((eb) => ["medias.id", eb.fn.countAll<string>().as("count")])
      .groupBy("medias.id")
      .orderBy("count", "desc")
      .orderBy("medias.id", "asc")
      .limit(TOP_MEDIAS)
      .execute(),
    sql<{ genre: string; count: string }>`
      select "tag"->>'key' as "genre", count(distinct "medias"."id") as "count"
      from "userHistories"
      inner join "chapters" on "chapters"."id" = "userHistories"."chapterId"
      inner join "medias" on "medias"."id" = "chapters"."mediaId"
      cross join lateral unnest("medias"."tags") as "tags"("tag")
      where "userHistories"."userId" = ${userId}
        and "userHistories"."completed"
        and "medias"."deletedAt" is null
        and "medias"."contentRating"::text = any(${contentRatings})
        and "tag"->>'key' = any(${GENRE_KEYS})
      group by "genre"
      order by "count" desc, "genre" asc
    `.execute(db),
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
    genres: genres.rows.map((row) => ({ genre: row.genre, count: Number(row.count) })),
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
    description: `Returns the reading, library and upload statistics of a user. Reading and library stats are \`null\` when the user hides their library, unless you are that user. The statistics can be up to ${CACHE_TTL_SECONDS / 60} minutes old.\n\n**Authentication:** optional.`,
    tags: ["Users"],
    responses: {
      200: {
        description: "The user's stats.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(statsSchema)) } },
      },
      ...getOpenApiResponses({
        404: "No user with the given ID exists, or the user is banned.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
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
      visible ? countLibraryEntries(db, targetUser.id) : null,
      getUploads(db, targetUser.id),
    ])
    const stats = { reading, library, uploads } satisfies Stats

    await cacheClient.users.stats.set(cacheKey, stats, CACHE_TTL_SECONDS)

    return c.ok(stats)
  },
)
