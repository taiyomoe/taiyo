import { commentReportAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { closeCommentReports, closeStatusSchema } from "../utils/comment-reports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({
  reportIds: bulkIdsSchema("reports", [
    "2f6a9c3e-8b1d-4e7a-9c5f-3b8e1a6d4c2f",
    "7b3e5d1a-4c9f-4b2e-8a6d-5e1c7f3b9a4d",
  ]),
  status: closeStatusSchema,
})
const skippedReportSchema = skippedSchema(
  "report",
  ["NOT_FOUND", "CLOSED"],
  "Why the report was left alone: it does not exist, or it was already closed.",
)

export const closeCommentReportsHandler = new Hono().patch(
  "/",
  describeRoute({
    summary: "Close comment reports in bulk",
    description: `Closes several reports at once as resolved or dismissed, each along with every other open report on the same comment. Reports that do not exist or are already closed are skipped and reported. The reporter of each closed report is notified of the outcome, unless it is you, and earns ${config.reports.rewardPoints} points when it is resolved.\n\n**Required roles:** moderator, admin.`,
    tags: ["Comment reports"],
    responses: {
      200: {
        description: "The closed and skipped reports.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("reports", "closed", skippedReportSchema)),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(commentReportAudit.CLOSE_MANY),
  withAuth("comment.review"),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db } = c.var
    const { reportIds, status } = c.var.json
    const rows = await db
      .selectFrom("commentReports")
      .select(["id", "commentId", "status"])
      .where("id", "in", reportIds)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(reportIds, rows)
    const open = found.filter((row) => row.status === "OPEN")
    const commentIds = [...new Set(open.map((row) => row.commentId))]

    await closeCommentReports(c.var, commentIds, { status })

    c.var.audit.set({ changes: { after: { commentIds, status } } })

    return c.ok({
      done: open.map((row) => row.id),
      skipped: [
        ...found
          .filter((row) => row.status !== "OPEN")
          .map((row) => ({ id: row.id, reason: "CLOSED" as const })),
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
      ],
    })
  },
)
