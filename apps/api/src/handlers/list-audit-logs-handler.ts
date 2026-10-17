import { auditLogAudit } from "@taiyomoe/audit"
import { AUDIT_ACTOR_TYPES, AUDIT_OUTCOMES, AUDIT_SEVERITIES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { auditLogSchema, fromAuditLogs, selectAuditLogs, toAuditLog } from "../utils/audit-logs"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const filterField = (description: string) =>
  z.string().min(1).max(200).optional().meta({ description })
const listAuditLogsQuerySchema = paginationQuerySchema.extend({
  actorId: filterField("Only entries performed by this actor (a user id, `anonymous`, or a job)."),
  actorType: z.enum(AUDIT_ACTOR_TYPES).optional().meta({ description: "Only this kind of actor." }),
  action: filterField("Only entries with this exact action, e.g. `media.CREATE`."),
  actionPrefix: filterField("Only entries whose action starts with this, e.g. `media.`."),
  targetType: filterField("Only entries performed on this kind of resource, e.g. `media`."),
  targetId: filterField("Only entries performed on the resource with this id."),
  outcome: z.enum(AUDIT_OUTCOMES).optional().meta({ description: "Only this outcome." }),
  severity: z.enum(AUDIT_SEVERITIES).optional().meta({ description: "Only this severity." }),
  from: z.iso.datetime().optional().meta({ description: "Only entries recorded at or after." }),
  to: z.iso.datetime().optional().meta({ description: "Only entries recorded before." }),
})

export const listAuditLogsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List audit logs",
    description:
      "Lists every recorded action, newest first. Filters combine with AND. Listing the audit log is itself recorded.\n\n**Required roles:** admin.",
    tags: ["Audit logs"],
    responses: {
      200: {
        description: "Matching audit log entries.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(auditLogSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  audited(auditLogAudit.LIST),
  withAuth("read", "AuditLog"),
  validateQuery(listAuditLogsQuerySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, ...filters } = c.var.query
    const filtered = fromAuditLogs(db).where((eb) =>
      eb.and([
        ...(filters.actorId === undefined ? [] : [eb("auditLogs.actorId", "=", filters.actorId)]),
        ...(filters.actorType === undefined
          ? []
          : [eb("auditLogs.actorType", "=", filters.actorType)]),
        ...(filters.action === undefined ? [] : [eb("auditLogs.action", "=", filters.action)]),
        ...(filters.actionPrefix === undefined
          ? []
          : [eb("auditLogs.action", "^@", filters.actionPrefix)]),
        ...(filters.targetType === undefined
          ? []
          : [eb("auditLogs.targetType", "=", filters.targetType)]),
        ...(filters.targetId === undefined
          ? []
          : [eb("auditLogs.targetId", "=", filters.targetId)]),
        ...(filters.outcome === undefined ? [] : [eb("auditLogs.outcome", "=", filters.outcome)]),
        ...(filters.severity === undefined
          ? []
          : [eb("auditLogs.severity", "=", filters.severity)]),
        ...(filters.from === undefined
          ? []
          : [eb("auditLogs.createdAt", ">=", new Date(filters.from))]),
        ...(filters.to === undefined ? [] : [eb("auditLogs.createdAt", "<", new Date(filters.to))]),
      ]),
    )
    const [rows, totalRow] = await Promise.all([
      selectAuditLogs(filtered)
        .orderBy("auditLogs.createdAt", "desc")
        .orderBy("auditLogs.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      filtered.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(rows.map(toAuditLog), { page, perPage, total: Number(totalRow.count) })
  },
)
