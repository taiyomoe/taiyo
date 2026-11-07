import { commentReportAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid() })
const bodySchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]).meta({
    description: "RESOLVED once acted on, DISMISSED when the comment is fine.",
    example: "DISMISSED",
  }),
})

export const closeCommentReportHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Close a comment report",
    description:
      "Marks a report as resolved or dismissed, along with every other open report on the same comment. Deleting the comment as a moderator resolves its reports on its own.\n\n**Required roles:** moderator, admin.",
    tags: ["Comment reports"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Reports closed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  closed: z.int().meta({ description: "How many open reports were closed." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No comment report with the given id exists.",
        409: "The report is already closed.",
        422: "The request data failed validation.",
      }),
    },
  }),
  audited(commentReportAudit.CLOSE),
  withAuth("comment.review"),
  validateParam(paramSchema),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { id } = c.var.param
    const { status } = c.var.json
    const report = await db
      .selectFrom("commentReports")
      .select(["commentId", "status"])
      .where("id", "=", id)
      .forUpdate()
      .executeTakeFirst()

    if (report === undefined) {
      return c.fail("COMMENT_REPORT_NOT_FOUND")
    }

    if (report.status !== "OPEN") {
      return c.fail("COMMENT_REPORT_CLOSED")
    }

    const result = await db
      .updateTable("commentReports")
      .set({ status, resolverId: user.id, resolvedAt: sql<Date>`CURRENT_TIMESTAMP` })
      .where("commentId", "=", report.commentId)
      .where("status", "=", "OPEN")
      .executeTakeFirst()

    c.var.audit.set({ target: { commentId: report.commentId, status } })

    return c.ok({ closed: Number(result.numUpdatedRows) })
  },
)
