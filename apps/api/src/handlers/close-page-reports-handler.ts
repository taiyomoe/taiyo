import { chapterReportAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { closePageReports, closingStatusSchema, lockPageReports } from "../utils/page-reports"
import { apiSuccessEnvelope } from "../utils/schemas"

const closePageReportsSchema = z.object({
  reportIds: bulkIdsSchema("page reports", [
    "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
    "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
  ]),
  status: closingStatusSchema,
})
const skippedReportSchema = skippedSchema(
  "page report",
  ["NOT_FOUND", "CLOSED"],
  "Why the report was left alone: it does not exist, or it is already closed.",
)

export const closePageReportsHandler = new Hono().patch(
  "/page-reports",
  describeRoute({
    summary: "Close page reports in bulk",
    description: `Closes several page reports at once as resolved or dismissed, along with every other open report on the same pages. Reports that do not exist or are already closed are skipped and reported. The reporter of each closed report is notified of the outcome, unless it is you, and earns ${config.reports.rewardPoints} points when it is resolved.\n\n**Required roles:** uploader, moderator, admin.`,
    tags: ["Page reports"],
    responses: {
      200: {
        description: "The closed and skipped reports.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("page reports", "closed", skippedReportSchema).extend({
                  closed: z.int().meta({
                    description:
                      "The number of open reports that were closed, the other reports on the same pages included.",
                    example: 5,
                  }),
                }),
              ),
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
  audited(chapterReportAudit.CLOSE_MANY),
  withAuth("pageReport.review"),
  validateJson(closePageReportsSchema),
  withTransaction,
  async (c) => {
    const { db } = c.var
    const { reportIds, status } = c.var.json
    const { found, missing } = partitionFound(reportIds, await lockPageReports(db, reportIds))
    const open = found.filter((report) => report.status === "OPEN")
    const done = open.map((report) => report.id)
    const closed = await closePageReports(c.var, { reports: open, status })

    c.var.audit.set({ changes: { after: { reportIds: done, status } } })

    return c.ok({
      done,
      skipped: [
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
        ...found
          .filter((report) => report.status !== "OPEN")
          .map((report) => ({ id: report.id, reason: "CLOSED" as const })),
      ],
      closed,
    })
  },
)
