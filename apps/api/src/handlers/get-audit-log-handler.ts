import { auditLogAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withPreviews } from "../utils/audit-log-previews"
import { auditLogSchema, fromAuditLogs, selectAuditLogs, toAuditLog } from "../utils/audit-logs"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid() })

export const getAuditLogHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get an audit log entry",
    description:
      "Fetches one recorded action by id. Reading an entry is itself recorded.\n\n**Required roles:** admin.",
    tags: ["Audit logs"],
    responses: {
      200: {
        description: "The audit log entry.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(auditLogSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No audit log entry with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  audited(auditLogAudit.GET),
  withAuth("read", "AuditLog"),
  validateParam(paramSchema),
  async (c) => {
    const row = await selectAuditLogs(
      fromAuditLogs(c.var.db).where("auditLogs.id", "=", c.var.param.id),
    ).executeTakeFirst()

    if (!row) {
      return c.fail("AUDIT_LOG_NOT_FOUND")
    }

    const [entry] = await withPreviews(c.var.db, [toAuditLog(row)])

    return entry === undefined ? c.fail("AUDIT_LOG_NOT_FOUND") : c.ok(entry)
  },
)
