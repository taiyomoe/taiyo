import { groupReportAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the report." }) })
const reviewSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]).meta({
    description:
      "The outcome of the review: RESOLVED when action was taken on the group, DISMISSED when nothing was wrong.",
    example: "RESOLVED",
  }),
  note: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => (value === undefined || value === "" ? null : value))
    .meta({
      description: "An internal note about the decision, up to 2000 characters.",
      example: "Confirmed with the original group.",
    }),
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
    const report = await db
      .selectFrom("groupReports")
      .select("groupId")
      .where("id", "=", id)
      .executeTakeFirst()

    if (report === undefined) {
      return c.fail("GROUP_REPORT_NOT_FOUND")
    }

    const reviewed = await db
      .updateTable("groupReports")
      .set({ status, reviewerId: user.id, reviewerNote: note })
      .where("id", "=", id)
      .where("status", "=", "PENDING")
      .returning("id")
      .executeTakeFirst()

    if (reviewed === undefined) {
      return c.fail("GROUP_REPORT_NOT_PENDING")
    }

    c.var.audit.set({ target: { groupId: report.groupId, status } })

    return c.ok({ id })
  },
)
