import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getMainCoverUrls, getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"

const isTimeZone = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en", { timeZone: value }).resolvedOptions().timeZone !== ""
  } catch {
    return false
  }
}
const querySchema = z.object({
  contentRating: contentRatingsQuerySchema,
  timeZone: z
    .string()
    .max(64)
    .refine(isTimeZone)
    .default("UTC")
    .meta({ description: "IANA time zone the days are cut in.", example: "Europe/Lisbon" }),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})
const entrySchema = z.object({
  day: z.iso.date().meta({ description: "The day the chapters were read, in `timeZone`." }),
  media: z.object({ id: z.uuid(), title: z.string().nullable(), coverUrl: z.url().nullable() }),
  chapters: z.number().int().meta({ description: "Distinct chapter numbers read that day." }),
  firstNumber: z.number(),
  lastNumber: z.number(),
  lastReadAt: z.iso.datetime(),
})
const historySchema = z.object({
  hidden: z.boolean().meta({ description: "Whether the user hides their library from you." }),
  entries: entrySchema.array(),
})

export const listUserReadingHistoryHandler = new Hono().get(
  "/:id/reading-history",
  describeRoute({
    summary: "List a user's recent reading",
    description:
      "The titles a user read recently, one entry per title and day, with the chapter range read that day. Chapters only marked as read are left out. Empty when the user hides their library, unless you are that user.\n\n**Authentication:** optional.",
    tags: ["Users"],
    responses: {
      200: {
        description: "Recent reading, most recent first.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(historySchema)) } },
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
