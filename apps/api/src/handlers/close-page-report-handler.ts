import { chapterReportAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { closePageReports, closingStatusSchema, lockPageReports } from "../utils/page-reports"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  reportId: z.uuid().meta({
    description: "The ID of the page report.",
    example: "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
  }),
})
const bodySchema = z.object({ status: closingStatusSchema })

export const closePageReportHandler = new Hono().patch(
  "/page-reports/:reportId",
  describeRoute({
    summary: "Close a page report",
    description:
      "Closes a page report as resolved or dismissed, along with every other open report on the same page.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Page reports"],
    responses: {
      200: {
        description: "Reports closed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  closed: z.int().meta({
                    description: "The number of open reports on the page that were closed.",
                    example: 3,
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
        404: "No page report with the given ID exists.",
        409: "The report is already closed.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(chapterReportAudit.CLOSE, (c) => ({ id: c.req.param("reportId") })),
  withAuth("pageReport.review"),
  validateParam(paramSchema),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { reportId } = c.var.param
    const { status } = c.var.json
    const [report] = await lockPageReports(db, [reportId])

    if (report === undefined) {
      return c.fail("PAGE_REPORT_NOT_FOUND")
    }

    if (report.status !== "OPEN") {
      return c.fail("PAGE_REPORT_CLOSED")
    }

    const closed = await closePageReports(db, { reports: [report], status, resolverId: user.id })

    return c.ok({ closed })
  },
)
