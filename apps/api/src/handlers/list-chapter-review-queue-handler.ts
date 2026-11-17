import { LANGUAGES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { hasContent } from "../utils/chapter-release"
import {
  selectSubmissionColumns,
  selectSubmissions,
  submissionSearchSchema,
  withSubmissionDetails,
} from "../utils/chapter-submissions"
import { matchChapterSearch } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, chapterSubmissionSchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  search: submissionSearchSchema,
  language: z
    .enum(LANGUAGES)
    .optional()
    .meta({ description: "Only list the chapters in this language.", example: "pt_br" }),
})

export const listChapterReviewQueueHandler = new Hono().get(
  "/review-queue",
  describeRoute({
    summary: "List chapters waiting for review",
    description:
      "Lists the chapters waiting for review, oldest first, with their media, credits and uploader. Chapters whose pages are still being processed are left out.\n\n**Required roles:** uploader, admin.",
    tags: ["Chapter review"],
    responses: {
      200: {
        description: "The chapters waiting for review.",
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
  withAuth("chapter.review"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search, language } = c.var.query
    const base = selectSubmissions(db)
      .where("chapters.status", "=", "PENDING")
      .where(hasContent)
      .where((eb) => matchChapterSearch(eb, search))
      .where((eb) => (language === undefined ? eb.and([]) : eb("chapters.language", "=", language)))
    const [rows, totalRow] = await Promise.all([
      selectSubmissionColumns(base)
        .orderBy("chapters.createdAt", "asc")
        .orderBy("chapters.id", "asc")
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
