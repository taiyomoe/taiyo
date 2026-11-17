import { userReportAudit } from "@taiyomoe/audit"
import { USER_REPORT_REASONS, USER_REPORT_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reportDetailsSchema } from "../utils/schemas"

const createReportSchema = z.object({
  reason: z
    .enum(USER_REPORT_REASONS)
    .meta({ description: "Why you report the user.", example: "INAPPROPRIATE_PROFILE" }),
  details: reportDetailsSchema("Their avatar and about text are insulting."),
})

export const createUserReportHandler = new Hono().post(
  "/:id/reports",
  describeRoute({
    summary: "Report a user",
    description:
      "Reports the profile of a user to the moderators, who never tell the user who reported it. You can have one pending report per user, and you cannot report yourself.\n\n**Authentication:** signed-in user.",
    tags: ["User reports"],
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
                    .enum(USER_REPORT_STATUSES)
                    .meta({ description: "The status of the report.", example: "PENDING" }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You do not have permission to perform this action, or the user is you.",
        404: "No user with the given ID exists.",
        409: "You already have a pending report on this user.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(userReportAudit.CREATE),
  withAuth("userReport.create"),
  rateLimit({ prefix: "user-report", windowMs: 60_000, limit: 5 }),
  validateJson(createReportSchema),
  checkUser(),
  withTransaction,
  async (c) => {
    const { db, targetUser, user } = c.var
    const { reason, details } = c.var.json

    if (targetUser.id === user.id) {
      return c.fail("USER_REPORT_SELF")
    }

    const row = await db
      .insertInto("userReports")
      .values({ userId: targetUser.id, reporterId: user.id, reason, details })
      .onConflict((oc) =>
        oc.columns(["userId", "reporterId"]).where("status", "=", "PENDING").doNothing(),
      )
      .returning(["id", "status"])
      .executeTakeFirst()

    if (row === undefined) {
      return c.fail("USER_REPORT_EXISTS")
    }

    c.var.audit.set({ target: { reportId: row.id, reason } })

    return c.ok({ id: row.id, status: row.status })
  },
)
