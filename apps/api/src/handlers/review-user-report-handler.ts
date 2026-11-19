import { userReportAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reportNoteSchema, reportOutcomeSchema } from "../utils/schemas"
import { reviewUserReport } from "../utils/user-reports"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the report." }) })
const reviewSchema = z.object({
  status: reportOutcomeSchema("user"),
  note: reportNoteSchema("Removed the avatar and the about text."),
})

export const reviewUserReportHandler = new Hono().post(
  "/:id/review",
  describeRoute({
    summary: "Review a user report",
    description: `Reviews a pending report on a user, closing it as resolved or dismissed. The reporter is notified of the outcome, unless it is you, and earns ${config.reports.rewardPoints} points when it is resolved.\n\n**Required roles:** moderator, admin.`,
    tags: ["User reports"],
    responses: {
      201: {
        description: "Report reviewed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the report." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No user report with the given ID exists.",
        409: "The report was already reviewed.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(userReportAudit.REVIEW),
  withAuth("userReport.review"),
  validateParam(paramSchema),
  validateJson(reviewSchema),
  withTransaction,
  async (c) => {
    const { id } = c.var.param
    const { status, note } = c.var.json
    const result = await reviewUserReport(c.var, { reportId: id, status, note })

    if (!result.ok) {
      return c.fail(result.error)
    }

    c.var.audit.set({ target: { userId: result.userId, status } })

    return c.ok({ id })
  },
)
