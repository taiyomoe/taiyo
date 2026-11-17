import { userReportAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reportNoteSchema, reportOutcomeSchema } from "../utils/schemas"
import { reviewUserReport } from "../utils/user-reports"

const reviewSchema = z.object({
  reportIds: bulkIdsSchema("reports", [
    "3f8b1d6e-2c4a-4e7b-9a5d-8c1f3e6b2a49",
    "b7d2e9a4-6f1c-4b3e-8d5a-1e9c4f7b2d63",
  ]),
  status: reportOutcomeSchema("user"),
  note: reportNoteSchema("Removed the avatar and the about text."),
})
const skippedReportSchema = skippedSchema(
  "report",
  ["NOT_FOUND", "NOT_PENDING"],
  "Why the report was left alone: it does not exist or was already reviewed.",
)
const SKIP_REASONS = {
  USER_REPORT_NOT_FOUND: "NOT_FOUND",
  USER_REPORT_NOT_PENDING: "NOT_PENDING",
} as const

export const reviewUserReportsHandler = new Hono().post(
  "/review",
  describeRoute({
    summary: "Review user reports in bulk",
    description:
      "Reviews several pending reports on users at once, closing them all as resolved or dismissed with the same note. Reports that do not exist or were already reviewed are skipped and reported.\n\n**Required roles:** moderator, admin.",
    tags: ["User reports"],
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
  audited(userReportAudit.REVIEW_MANY),
  withAuth("userReport.review"),
  validateJson(reviewSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { reportIds, status, note } = c.var.json
    const done: string[] = []
    const skipped: Array<z.infer<typeof skippedReportSchema>> = []

    for (const reportId of reportIds) {
      const result = await reviewUserReport(db, { reportId, reviewerId: user.id, status, note })

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
