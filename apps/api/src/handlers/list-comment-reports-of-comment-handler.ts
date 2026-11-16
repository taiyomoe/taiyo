import { COMMENT_REPORT_STATUSES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import {
  commentReportSchema,
  selectCommentReports,
  toCommentReport,
} from "../utils/comment-reports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the comment." }) })
const querySchema = paginationQuerySchema.extend({
  status: z
    .enum(COMMENT_REPORT_STATUSES)
    .default("OPEN")
    .meta({ description: "The status of the reports to list.", example: "OPEN" }),
})

export const listCommentReportsOfCommentHandler = new Hono().get(
  "/:id/reports",
  describeRoute({
    summary: "List the reports on a comment",
    description:
      "Lists the reports on a comment with the given `status`, newest first, even once the comment was removed.\n\n**Required roles:** moderator, admin.",
    tags: ["Comment reports"],
    responses: {
      200: {
        description: "The reports on the comment.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(commentReportSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No comment with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  withAuth("comment.review"),
  validateParam(paramSchema),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { id } = c.var.param
    const { page, perPage, status } = c.var.query
    const comment = await db
      .selectFrom("comments")
      .select("id")
      .where("id", "=", id)
      .executeTakeFirst()

    if (comment === undefined) {
      return c.fail("COMMENT_NOT_FOUND")
    }

    const base = db
      .selectFrom("commentReports")
      .where("commentId", "=", id)
      .where("status", "=", status)
    const [rows, totalRow] = await Promise.all([
      selectCommentReports(db)
        .where("r.commentId", "=", id)
        .where("r.status", "=", status)
        .orderBy("r.createdAt", "desc")
        .orderBy("r.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(rows.map(toCommentReport), { page, perPage, total: Number(totalRow.count) })
  },
)
