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
  chapterCount: z
    .int()
    .meta({ description: "The number of published chapters by the group.", example: 342 }),
  pageCount: z
    .int()
    .meta({ description: "The number of pages across those chapters.", example: 6840 }),
  readCount: z.int().meta({
    description:
      "The number of times users read those chapters, counting each user once per chapter.",
    example: 51230,
  }),
  averageDaysBetweenReleases: z.number().nullable().meta({
    description:
      "The average number of days between two releases, if the group has at least two chapters.",
    example: 3.5,
  }),
  monthly: z
    .object({
      month: z.string().meta({ description: "The month, as `YYYY-MM`.", example: "2026-10" }),
      count: z
        .int()
        .meta({ description: "The number of chapters released that month.", example: 12 }),
    })
    .array()
    .meta({
      description: `The chapters released in each of the last ${MONTHS} months, oldest first.`,
    }),
  topUploaders: userSummarySchema
    .extend({
      count: z
        .int()
        .meta({ description: "The number of those chapters the user uploaded.", example: 120 }),
    })
    .array()
    .meta({
      description: `The ${TOP_UPLOADERS} users who uploaded the most chapters, most first.`,
    }),
  mostRead: z
    .object({
      id: z.uuid().meta({ description: "The ID of the media." }),
      title: z.string().nullable().meta({
        description: "The main title of the media, if any.",
        example: "Vinland Saga",
      }),
      coverUrl: z
        .url()
        .nullable()
        .meta({ description: "The URL of the media's main cover, if any." }),
      readCount: z.int().meta({
        description: "The number of times users read the group's chapters of the media.",
        example: 8410,
      }),
    })
    .array()
    .meta({
      description: `The ${TOP_MEDIAS} medias whose chapters were read the most, most first.`,
    }),
})

export const getGroupStatsHandler = new Hono().get(
  "/:id/stats",
  describeRoute({
    summary: "Get a group's stats",
    description:
      "Returns stats on the group's published chapters that match the content ratings: totals, releases per month, top uploaders and most read medias.\n\n**Authentication:** none.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "The group's stats.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(statsSchema)) } },
      },
      ...getOpenApiResponses({
        404: "No group with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
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
        .groupBy("users.id")
        .select([
          "users.id",
          "users.username",
          "users.displayUsername",
          "users.image",
          "users.nameEffect",
          "users.avatarBorder",
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
