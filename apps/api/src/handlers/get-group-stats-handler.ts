import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { getMainCoverUrls, getMainTitles, selectVisibleChapters } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema, userSummarySchema } from "../utils/schemas"

const MONTHS = 12
const TOP_UPLOADERS = 6
const TOP_MEDIAS = 5
const DAY_MS = 86_400_000
const querySchema = z.object({ contentRating: contentRatingsQuerySchema })
const statsSchema = z.object({
  chapterCount: z.int(),
  pageCount: z.int().meta({ description: "Pages across every chapter of the group." }),
  readCount: z.int().meta({ description: "How many times readers opened the group's chapters." }),
  averageDaysBetweenReleases: z.number().nullable().meta({
    description: "Average gap between two releases, in days. Null below two chapters.",
  }),
  monthly: z
    .object({
      month: z.string().meta({ description: "The month, as YYYY-MM.", example: "2026-10" }),
      count: z.int(),
    })
    .array()
    .meta({ description: "Chapters released in each of the last 12 months, oldest first." }),
  topUploaders: userSummarySchema.extend({ count: z.int() }).array(),
  mostRead: z
    .object({
      id: z.uuid(),
      title: z.string().nullable(),
      coverUrl: z.string().nullable(),
      readCount: z.int(),
    })
    .array(),
})

export const getGroupStatsHandler = new Hono().get(
  "/:id/stats",
  describeRoute({
    summary: "Get a group's stats",
    description:
      "Aggregates the group's released chapters: totals, releases per month, top uploaders and most read medias.\n\n**Authentication:** none.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "The group's stats.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(statsSchema)) } },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The provided id or query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkGroup(),
  async (c) => {
    const { db, group } = c.var
    const chapters = () =>
      selectVisibleChapters(db, { contentRatings: c.var.query.contentRating, groupId: group.id })
    const since = new Date()

    since.setUTCDate(1)
    since.setUTCHours(0, 0, 0, 0)
    since.setUTCMonth(since.getUTCMonth() - (MONTHS - 1))

    const [totals, reads, monthly, uploaders, mostRead] = await Promise.all([
      chapters()
        .select((eb) => [
          eb.fn.countAll<string>().as("count"),
          sql<string>`coalesce(sum(cardinality(${sql.ref("chapters.pages")})), 0)`.as("pages"),
          eb.fn.min<Date | null>("chapters.createdAt").as("first"),
          eb.fn.max<Date | null>("chapters.createdAt").as("last"),
        ])
        .executeTakeFirstOrThrow(),
      chapters()
        .innerJoin("userHistories", "userHistories.chapterId", "chapters.id")
        .select((eb) => eb.fn.countAll<string>().as("count"))
        .executeTakeFirstOrThrow(),
      chapters()
        .where("chapters.createdAt", ">=", since)
        .select([
          sql<string>`to_char(date_trunc('month', ${sql.ref("chapters.createdAt")}), 'YYYY-MM')`.as(
            "month",
          ),
          sql<string>`count(*)`.as("count"),
        ])
        .groupBy("month")
        .execute(),
      chapters()
        .innerJoin("users", "users.id", "chapters.uploaderId")
        .groupBy(["users.id", "users.username", "users.displayUsername", "users.image"])
        .select([
          "users.id",
          "users.username",
          "users.displayUsername",
          "users.image",
          sql<string>`count(*)`.as("count"),
        ])
        .orderBy("count", "desc")
        .orderBy("users.username", "asc")
        .limit(TOP_UPLOADERS)
        .execute(),
      chapters()
        .innerJoin("userHistories", "userHistories.chapterId", "chapters.id")
        .groupBy("chapters.mediaId")
        .select(["chapters.mediaId", sql<string>`count(*)`.as("count")])
        .orderBy("count", "desc")
        .orderBy("chapters.mediaId", "asc")
        .limit(TOP_MEDIAS)
        .execute(),
    ])
    const mediaIds = mostRead.map((row) => row.mediaId)
    const [titles, coverUrls] = await Promise.all([
      getMainTitles(db, mediaIds),
      getMainCoverUrls(db, mediaIds),
    ])
    const counts = new Map(monthly.map((row) => [row.month, Number(row.count)]))
    const chapterCount = Number(totals.count)

    return c.ok({
      chapterCount,
      pageCount: Number(totals.pages),
      readCount: Number(reads.count),
      averageDaysBetweenReleases:
        chapterCount < 2 || totals.first === null || totals.last === null
          ? null
          : (new Date(totals.last).getTime() - new Date(totals.first).getTime()) /
            DAY_MS /
            (chapterCount - 1),
      monthly: Array.from({ length: MONTHS }, (_, index) => {
        const date = new Date(since)

        date.setUTCMonth(since.getUTCMonth() + index)

        const month = date.toISOString().slice(0, 7)

        return { month, count: counts.get(month) ?? 0 }
      }),
      topUploaders: uploaders.map(({ count, ...user }) => ({ ...user, count: Number(count) })),
      mostRead: mostRead.map((row) => ({
        id: row.mediaId,
        title: titles.get(row.mediaId) ?? null,
        coverUrl: coverUrls.get(row.mediaId) ?? null,
        readCount: Number(row.count),
      })),
    })
  },
)
