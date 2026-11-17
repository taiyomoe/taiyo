import { groupReportAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { reviewGroupReport } from "../utils/group-reports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reportNoteSchema, reportOutcomeSchema } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the report." }) })
const reviewSchema = z.object({
  status: reportOutcomeSchema("group"),
  note: reportNoteSchema("Confirmed with the original group."),
})

export const reviewGroupReportHandler = new Hono().post(
  "/:id/review",
  describeRoute({
    summary: "Review a group report",
    description:
      "Reviews a pending report on a group, closing it as resolved or dismissed.\n\n**Required roles:** moderator, admin.",
    tags: ["Group reports"],
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
        404: "No group report with the given ID exists.",
        409: "The report was already reviewed.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(groupReportAudit.REVIEW),
  withAuth("groupReport.review"),
  validateParam(paramSchema),
  validateJson(reviewSchema),
  async (c) => {
    const { db, user } = c.var
    const { id } = c.var.param
    const { status, note } = c.var.json
    const result = await reviewGroupReport(db, {
      reportId: id,
      reviewerId: user.id,
      status,
      note,
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    c.var.audit.set({ target: { groupId: result.groupId, status } })

    return c.ok({ id })
  },
)
