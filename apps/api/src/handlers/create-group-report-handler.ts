import { groupReportAudit } from "@taiyomoe/audit"
import { GROUP_REPORT_REASONS, GROUP_REPORT_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const createReportSchema = z.object({
  reason: z.enum(GROUP_REPORT_REASONS).meta({ description: "Why the group is reported." }),
  details: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => (value === undefined || value === "" ? null : value))
    .meta({ description: "Anything that helps moderators look into it." }),
})

export const createGroupReportHandler = new Hono().post(
  "/:id/reports",
  describeRoute({
    summary: "Report a group",
    description:
      "Files a report about the group for moderators to review. The group never learns who sent it.\n\n**Authentication:** any signed-in user.",
    tags: ["Group reports"],
    requestBody: {
      content: { "application/json": await resolver(createReportSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Report filed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ id: z.uuid(), status: z.enum(GROUP_REPORT_STATUSES) })),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        409: "You already have a pending report for this group.",
        422: "The request data failed validation.",
        429: "Too many requests — slow down.",
      }),
    },
  }),
  audited(groupReportAudit.CREATE),
  withAuth("groupReport.create"),
  rateLimit({ prefix: "group-report", windowMs: 60_000, limit: 5 }),
  validateJson(createReportSchema),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { db, group, user } = c.var
    const { reason, details } = c.var.json
    const row = await db
      .insertInto("groupReports")
      .values({ groupId: group.id, reporterId: user.id, reason, details })
      .onConflict((oc) =>
        oc.columns(["groupId", "reporterId"]).where("status", "=", "PENDING").doNothing(),
      )
      .returning(["id", "status"])
      .executeTakeFirst()

    if (row === undefined) {
      return c.fail("GROUP_REPORT_EXISTS")
    }

    c.var.audit.set({ target: { reportId: row.id, reason } })

    return c.ok({ id: row.id, status: row.status })
  },
)
