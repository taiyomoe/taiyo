import { CHAPTER_STATUSES, LANGUAGES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import {
  selectSubmissionColumns,
  selectSubmissions,
  withSubmissionDetails,
} from "../utils/chapter-submissions"
import { matchChapterSearch } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, chapterSubmissionSchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(100).optional().meta({
    description:
      "Only list the chapters whose title or media title contains this text, or whose number is this number.",
    example: "one punch",
  }),
  mediaId: z.uuid().optional().meta({
    description: "Only list the chapters of this media.",
    example: "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
  }),
  language: z
    .enum(LANGUAGES)
    .optional()
    .meta({ description: "Only list the chapters in this language.", example: "pt_br" }),
  status: z
    .enum(CHAPTER_STATUSES)
    .optional()
    .meta({ description: "Only list the chapters with this status.", example: "SCHEDULED" }),
})

export const listManagedChaptersHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List chapters",
    description:
      "Lists the chapters of every media for management, whatever their status, newest first, with their media, uploader and credited groups.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The matching chapters.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(chapterSubmissionSchema.array(), paginationMetaSchema),
            ),
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
  withAuth("chapter.list"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search, mediaId, language, status } = c.var.query
    const base = selectSubmissions(db)
      .where((eb) => matchChapterSearch(eb, search))
      .where((eb) => (mediaId === undefined ? eb.and([]) : eb("chapters.mediaId", "=", mediaId)))
      .where((eb) => (language === undefined ? eb.and([]) : eb("chapters.language", "=", language)))
      .where((eb) => (status === undefined ? eb.and([]) : eb("chapters.status", "=", status)))
    const [rows, totalRow] = await Promise.all([
      selectSubmissionColumns(base)
        .orderBy("chapters.createdAt", "desc")
        .orderBy("chapters.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(await withSubmissionDetails(db, rows), {
      page,
      perPage,
      total: Number(totalRow.count),
    })
  },
)
