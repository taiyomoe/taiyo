import { CHAPTER_STATUSES, sql } from "@taiyomoe/db"
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
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, chapterSubmissionSchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z
    .enum(CHAPTER_STATUSES)
    .optional()
    .meta({ description: "Only list submissions with this status." }),
})

export const listMyChapterSubmissionsHandler = new Hono().get(
  "/me/chapter-submissions",
  describeRoute({
    summary: "List my chapter submissions",
    description:
      "Lists the chapters the current user submitted for review: the ones still waiting, the rejected ones with their reason, and the ones that were approved. Newest first.\n\n**Authentication:** signed-in user.",
    tags: ["Chapter review"],
    responses: {
      200: {
        description: "The current user's submissions.",
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
  withAuth(),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage, status } = c.var.query
    const base = selectSubmissions(db)
      .where("chapters.uploaderId", "=", user.id)
      .where((eb) =>
        eb.or([
          eb("chapters.status", "!=", "PUBLISHED"),
          eb("chapters.reviewerId", "is not", null),
        ]),
      )
      .where((eb) => (status === undefined ? eb.and([]) : eb("chapters.status", "=", status)))
    const [rows, totalRow] = await Promise.all([
      selectSubmissionColumns(base)
        .orderBy("chapters.createdAt", "desc")
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
