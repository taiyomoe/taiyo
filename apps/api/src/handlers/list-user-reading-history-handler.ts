import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getMainCoverUrls, getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema, timeZoneSchema } from "../utils/schemas"

const querySchema = z.object({
  contentRating: contentRatingsQuerySchema,
  timeZone: timeZoneSchema.meta({
    description: "The IANA time zone the days are cut in. Defaults to `UTC`.",
    example: "Europe/Lisbon",
  }),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20)
    .meta({ description: "The maximum number of entries to return.", example: 20 }),
})
const entrySchema = z.object({
  day: z.iso
    .date()
    .meta({ description: "The day the chapters were read, in `timeZone`.", example: "2026-09-21" }),
  media: z
    .object({
      id: z.uuid().meta({ description: "The ID of the media." }),
      title: z
        .string()
        .nullable()
        .meta({ description: "The main title of the media, if any.", example: "Solo Leveling" }),
      coverUrl: z
        .url()
        .nullable()
        .meta({ description: "The URL of the main cover of the media, if any." }),
    })
    .meta({ description: "The media the chapters belong to." }),
  chapters: z
    .int()
    .meta({ description: "The number of distinct chapter numbers read that day.", example: 3 }),
  firstNumber: z
    .number()
    .meta({ description: "The lowest chapter number read that day.", example: 110 }),
  lastNumber: z
    .number()
    .meta({ description: "The highest chapter number read that day.", example: 112 }),
  lastReadAt: z.iso
    .datetime()
    .meta({ description: "When the user last read one of these chapters that day." }),
})
const historySchema = z.object({
  hidden: z.boolean().meta({ description: "Whether the user hides their library from you." }),
  entries: entrySchema.array().meta({ description: "The entries, most recent first." }),
})

export const listUserReadingHistoryHandler = new Hono().get(
  "/:id/reading-history",
  describeRoute({
    summary: "List a user's recent reading",
    description:
      "Lists the media a user read recently, most recent first, one entry per media and day with the range of chapters read that day. Chapters only marked as read are left out. The list is empty when the user hides their library, unless you are that user.\n\n**Authentication:** optional.",
    tags: ["Users"],
    responses: {
      200: {
        description: "The recent reading of the user.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(historySchema)) } },
      },
      ...getOpenApiResponses({
        404: "No user with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkUser(),
  withOptionalAuth,
  async (c) => {
    const { db, targetUser, viewer } = c.var
    const { contentRating, timeZone, limit } = c.var.query

    if (targetUser.settings.showLibrary === false && viewer?.id !== targetUser.id) {
      return c.ok({ hidden: true, entries: [] })
    }

    const { rows } = await sql<{
      mediaId: string
      day: string
      chapters: string
      firstNumber: number
      lastNumber: number
      lastReadAt: string
    }>`
      select
        "chapters"."mediaId" as "mediaId",
        to_char(("userHistories"."updatedAt" at time zone 'UTC') at time zone ${timeZone}, 'YYYY-MM-DD') as "day",
        count(distinct "chapters"."number") as "chapters",
        min("chapters"."number") as "firstNumber",
        max("chapters"."number") as "lastNumber",
        to_char(max("userHistories"."updatedAt"), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "lastReadAt"
      from "userHistories"
      inner join "chapters" on "chapters"."id" = "userHistories"."chapterId"
      inner join "medias" on "medias"."id" = "chapters"."mediaId"
      where "userHistories"."userId" = ${targetUser.id}
        and (not "userHistories"."completed" or "userHistories"."pageId" is not null)
        and "chapters"."deletedAt" is null
        and "chapters"."status" = 'PUBLISHED'
        and "medias"."deletedAt" is null
        and greatest("medias"."contentRating", "chapters"."contentRating")::text = any(${contentRating})
      group by "chapters"."mediaId", "day"
      order by max("userHistories"."updatedAt") desc
      limit ${limit}
    `.execute(db)
    const mediaIds = [...new Set(rows.map((row) => row.mediaId))]
    const [titles, covers] = await Promise.all([
      getMainTitles(db, mediaIds),
      getMainCoverUrls(db, mediaIds),
    ])

    return c.ok({
      hidden: false,
      entries: rows.map((row) => ({
        day: row.day,
        media: {
          id: row.mediaId,
          title: titles.get(row.mediaId) ?? null,
          coverUrl: covers.get(row.mediaId) ?? null,
        },
        chapters: Number(row.chapters),
        firstNumber: row.firstNumber,
        lastNumber: row.lastNumber,
        lastReadAt: row.lastReadAt,
      })),
    })
  },
)
