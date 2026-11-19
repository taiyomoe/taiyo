import { groupReportAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, skippedSchema } from "../utils/bulk"
import { reviewGroupReport } from "../utils/group-reports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reportNoteSchema, reportOutcomeSchema } from "../utils/schemas"

const reviewSchema = z.object({
  reportIds: bulkIdsSchema("reports", [
    "9a4c2e7b-3d8f-4a1c-b6e5-7f2d9c4a1e38",
    "c6e3b9d1-8a2f-4c7e-9d4b-2a6f8e1c3b57",
  ]),
  status: reportOutcomeSchema("group"),
  note: reportNoteSchema("Confirmed with the original group."),
})
const skippedReportSchema = skippedSchema(
  "report",
  ["NOT_FOUND", "NOT_PENDING"],
  "Why the report was left alone: it does not exist or was already reviewed.",
)
const SKIP_REASONS = {
  GROUP_REPORT_NOT_FOUND: "NOT_FOUND",
  GROUP_REPORT_NOT_PENDING: "NOT_PENDING",
} as const

export const reviewGroupReportsHandler = new Hono().post(
  "/review",
  describeRoute({
    summary: "Review group reports in bulk",
    description: `Reviews several pending reports on groups at once, closing them all as resolved or dismissed with the same note. Reports that do not exist or were already reviewed are skipped and reported. The reporter of each reviewed report is notified of the outcome, unless it is you, and earns ${config.reports.rewardPoints} points when it is resolved.\n\n**Required roles:** moderator, admin.`,
    tags: ["Group reports"],
    responses: {
      201: {
        description: "The reviewed and skipped reports.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("reports", "reviewed", skippedReportSchema)),
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
  audited(groupReportAudit.REVIEW_MANY),
  withAuth("groupReport.review"),
  validateJson(reviewSchema),
  withTransaction,
  async (c) => {
    const { reportIds, status, note } = c.var.json
    const done: string[] = []
    const skipped: Array<z.infer<typeof skippedReportSchema>> = []

    for (const reportId of reportIds) {
      const result = await reviewGroupReport(c.var, { reportId, status, note })

      if (result.ok) {
        done.push(reportId)
      } else {
        skipped.push({ id: reportId, reason: SKIP_REASONS[result.error] })
      }
    }

    c.var.audit.set({ changes: { after: { reportIds: done, status } } })

    return c.ok({ done, skipped })
  },
)
