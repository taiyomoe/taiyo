import { type RawBuilder, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { AuditLogQueryError } from "../utils/audit-log-query"
import {
  auditLogFilterSchema,
  filterAuditLogs,
  fromAuditLogs,
  toQueryIssues,
} from "../utils/audit-logs"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const LIMIT = 8
const valueSchema = z.object({
  value: z.string().meta({ description: "The field value, exactly as KQL matches it." }),
  count: z.int().meta({ description: "How many matching entries have it." }),
})
const actorValueSchema = valueSchema.extend({
  type: z.string().meta({ description: "The kind of actor." }),
  displayName: z.string().nullable().meta({ description: "The actor's display name." }),
  image: z.string().nullable().meta({ description: "The actor's avatar, if a user." }),
})
const facetsSchema = z.object({
  total: z.int().meta({ description: "How many entries match." }),
  category: valueSchema.array(),
  action: valueSchema.array(),
  actor: actorValueSchema.array(),
  outcome: valueSchema.array(),
  severity: valueSchema.array(),
  targetType: valueSchema.array(),
  ip: valueSchema.array(),
})

export const getAuditLogFacetsHandler = new Hono().get(
  "/facets",
  describeRoute({
    summary: "Break audit logs down by field",
    description: `Returns the most common values of the main fields among matching entries, up to ${LIMIT} per field. Takes the same filters as listing.\n\n**Required roles:** admin.`,
    tags: ["Audit logs"],
    responses: {
      200: {
        description: "The top values per field.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(facetsSchema)) } },
      },
      ...getOpenApiResponses({ 422: "The query parameters or the KQL query failed validation." }),
    },
  }),
  withAuth("auditLog.read"),
  validateQuery(auditLogFilterSchema),
  async (c) => {
    let filtered: ReturnType<typeof filterAuditLogs>

    try {
      filtered = filterAuditLogs(fromAuditLogs(c.var.db), c.var.query)
    } catch (error) {
      if (error instanceof AuditLogQueryError) {
        return c.fail("VALIDATION_ERROR", toQueryIssues(error))
      }

      throw error
    }

    const topValues = (column: RawBuilder<unknown>) =>
      filtered
        .select([sql<string>`${column}::text`.as("value"), sql<number>`count(*)::int`.as("count")])
        .where(sql<boolean>`${column} is not null`)
        .groupBy(sql`1`)
        .orderBy(sql`2`, "desc")
        .orderBy(sql`1`)
        .limit(LIMIT)
        .execute()
    const [totalRow, category, action, actor, outcome, severity, targetType, ip] =
      await Promise.all([
        filtered.select(sql<number>`count(*)::int`.as("count")).executeTakeFirstOrThrow(),
        topValues(sql`split_part(${sql.ref("auditLogs.action")}, '.', 1)`),
        topValues(sql.ref("auditLogs.action")),
        filtered
          .select([
            "auditLogs.actorId as value",
            sql<string>`${sql.ref("auditLogs.actorType")}::text`.as("type"),
            sql<
              string | null
            >`coalesce(max(${sql.ref("users.displayUsername")}), max(${sql.ref("auditLogs.event")}->'audit'->'actor'->>'displayName'))`.as(
              "displayName",
            ),
            sql<string | null>`max(${sql.ref("users.image")})`.as("image"),
            sql<number>`count(*)::int`.as("count"),
          ])
          .groupBy(["auditLogs.actorId", "auditLogs.actorType"])
          .orderBy(sql`count(*)`, "desc")
          .orderBy("auditLogs.actorId")
          .limit(LIMIT)
          .execute(),
        topValues(sql.ref("auditLogs.outcome")),
        topValues(sql.ref("auditLogs.severity")),
        topValues(sql.ref("auditLogs.targetType")),
        topValues(sql.ref("auditLogs.ip")),
      ])

    return c.ok({
      total: totalRow.count,
      category,
      action,
      actor,
      outcome,
      severity,
      targetType,
      ip,
    })
  },
)
