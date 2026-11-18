import { commentReportAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { closeCommentReports, closeStatusSchema } from "../utils/comment-reports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the report." }) })
const bodySchema = z.object({ status: closeStatusSchema })

export const closeCommentReportHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Close a comment report",
    description: `Closes a report as resolved or dismissed, along with every other open report on the same comment. The reporter of each closed report is notified of the outcome, unless it is you, and earns ${config.reports.rewardPoints} points when it is resolved. Deleting the comment as a moderator already resolves its reports.\n\n**Required roles:** moderator, admin.`,
    tags: ["Comment reports"],
    responses: {
      200: {
        description: "Reports closed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  closed: z
                    .int()
                    .meta({ description: "The number of reports closed.", example: 2 }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No comment report with the given ID exists.",
        409: "The report is already closed.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(commentReportAudit.CLOSE),
  withAuth("comment.review"),
  validateParam(paramSchema),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db } = c.var
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

    const closed = await closeCommentReports(c.var, [report.commentId], { status })

    c.var.audit.set({ target: { commentId: report.commentId, status } })

    return c.ok({ closed })
  },
)
