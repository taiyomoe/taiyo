import { auditLogAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withPreviews } from "../utils/audit-log-previews"
import { AuditLogQueryError } from "../utils/audit-log-query"
import {
  auditLogFilterSchema,
  auditLogSchema,
  filterAuditLogs,
  fromAuditLogs,
  selectAuditLogs,
  toAuditLog,
  toQueryIssues,
} from "../utils/audit-logs"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const listAuditLogsQuerySchema = paginationQuerySchema.extend(auditLogFilterSchema.shape).extend({
  sort: z.enum(["desc", "asc"]).default("desc").meta({
    description: "`desc` for newest first, `asc` for oldest first. Defaults to `desc`.",
    example: "desc",
  }),
})

export const listAuditLogsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List audit logs",
    description:
      "Lists the recorded actions, newest first by default. `q` takes a KQL query, and the other filters combine with it using AND. Listing the audit log is itself recorded in it.\n\n**Required roles:** admin.",
    tags: ["Audit logs"],
    responses: {
      200: {
        description: "The matching audit log entries.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(auditLogSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation, or the KQL query is invalid.",
      }),
    },
  }),
  audited(auditLogAudit.LIST),
  withAuth("auditLog.read"),
  validateQuery(listAuditLogsQuerySchema),
  async (c) => {
    const { page, perPage, sort, ...filters } = c.var.query
    let filtered: ReturnType<typeof filterAuditLogs>

    try {
      filtered = filterAuditLogs(fromAuditLogs(c.var.db), filters)
    } catch (error) {
      if (error instanceof AuditLogQueryError) {
        return c.fail("VALIDATION_ERROR", toQueryIssues(error))
      }

      throw error
    }

    const [rows, totalRow] = await Promise.all([
      selectAuditLogs(filtered)
        .orderBy("auditLogs.createdAt", sort)
        .orderBy("auditLogs.id", sort)
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      filtered.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(await withPreviews(c.var.db, rows.map(toAuditLog)), {
      page,
      perPage,
      total: Number(totalRow.count),
    })
  },
)
