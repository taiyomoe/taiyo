import { reviewReportAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { closeStatusSchema } from "../utils/comment-reports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { closeReviewReports } from "../utils/reviews"
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

export const closeReviewReportsHandler = new Hono().patch(
  "/",
  describeRoute({
    summary: "Close review reports in bulk",
    description:
      "Closes several reports at once as resolved or dismissed, each along with every other open report on the same review. Reports that do not exist or are already closed are skipped and reported.\n\n**Required roles:** moderator, admin.",
    tags: ["Review reports"],
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
  audited(reviewReportAudit.CLOSE_MANY),
  withAuth("mediaReview.review"),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { reportIds, status } = c.var.json
    const rows = await db
      .selectFrom("mediaReviewReports")
      .select(["id", "reviewId", "status"])
      .where("id", "in", reportIds)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(reportIds, rows)
    const open = found.filter((row) => row.status === "OPEN")
    const reviewIds = [...new Set(open.map((row) => row.reviewId))]

    await closeReviewReports(db, { reviewIds, status, resolverId: user.id })

    c.var.audit.set({ changes: { after: { reviewIds, status } } })

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
