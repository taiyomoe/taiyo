import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { hasContent } from "../utils/chapter-release"
import {
  selectSubmissionColumns,
  selectSubmissions,
  withSubmissionDetails,
} from "../utils/chapter-submissions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, chapterSubmissionSchema } from "../utils/schemas"

export const listChapterReviewQueueHandler = new Hono().get(
  "/review-queue",
  describeRoute({
    summary: "List chapters waiting for review",
    description:
      "Lists the chapters submitted for review, oldest first, with their media, credits and uploader.\n\n**Required roles:** uploader, admin.",
    tags: ["Chapter review"],
    responses: {
      200: {
        description: "Chapters waiting for review.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(chapterSubmissionSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  withAuth("chapter.review"),
  validateQuery(paginationQuerySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage } = c.var.query
    const base = selectSubmissions(db).where("chapters.status", "=", "PENDING").where(hasContent)
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
