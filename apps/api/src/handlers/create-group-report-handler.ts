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
import { apiSuccessEnvelope, reportDetailsSchema } from "../utils/schemas"

const createReportSchema = z.object({
  reason: z
    .enum(GROUP_REPORT_REASONS)
    .meta({ description: "Why you report the group.", example: "STOLEN_WORK" }),
  details: reportDetailsSchema("They post our chapters with our credits page cropped out."),
})

export const createGroupReportHandler = new Hono().post(
  "/:id/reports",
  describeRoute({
    summary: "Report a group",
    description:
      "Reports the group to the moderators, who never tell the group who reported it. You can have one pending report per group.\n\n**Authentication:** signed-in user.",
    tags: ["Group reports"],
    responses: {
      201: {
        description: "Report created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the report." }),
                  status: z
                    .enum(GROUP_REPORT_STATUSES)
                    .meta({ description: "The status of the report.", example: "PENDING" }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No group with the given ID exists.",
        409: "You already have a pending report on this group.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
        429: "Too many requests, try again later.",
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
