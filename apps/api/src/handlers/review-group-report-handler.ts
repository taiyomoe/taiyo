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

const paramSchema = z.object({ id: z.uuid() })
const reviewSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]).meta({
    description: "RESOLVED when action was taken on the group, DISMISSED when nothing was wrong.",
  }),
  note: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => (value === undefined || value === "" ? null : value))
    .meta({ description: "Internal note about the decision." }),
})

export const reviewGroupReportHandler = new Hono().post(
  "/:id/review",
  describeRoute({
    summary: "Review a group report",
    description:
      "Closes a pending report as resolved or dismissed.\n\n**Required roles:** moderator, admin.",
    tags: ["Group reports"],
    requestBody: {
      content: { "application/json": await resolver(reviewSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Report reviewed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No report with the given id exists.",
        409: "The report was already reviewed.",
        422: "The request data failed validation.",
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
      .select(["id", "groupId", "status"])
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
