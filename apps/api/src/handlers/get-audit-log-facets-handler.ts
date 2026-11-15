import { AUDIT_ACTOR_TYPES, type RawBuilder, sql } from "@taiyomoe/db"
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
  value: z
    .string()
    .meta({ description: "The value of the field, exactly as KQL matches it.", example: "media" }),
  count: z
    .int()
    .meta({ description: "The number of matching entries with this value.", example: 42 }),
})
const actorValueSchema = valueSchema.extend({
  type: z.enum(AUDIT_ACTOR_TYPES).meta({ description: "The kind of actor.", example: "user" }),
  displayName: z
    .string()
    .nullable()
    .meta({ description: "The display name of the actor, if any.", example: "Kaito" }),
  image: z.string().nullable().meta({ description: "The URL of the user's avatar, if any." }),
  nameEffect: z
    .string()
    .nullable()
    .meta({ description: "The name effect the user has equipped, if any." }),
  avatarBorder: z
    .string()
    .nullable()
    .meta({ description: "The avatar border the user has equipped, if any." }),
})
const topValuesSchema = (field: string) =>
  valueSchema.array().meta({ description: `The most common ${field}, most frequent first.` })
const facetsSchema = z.object({
  total: z.int().meta({ description: "The number of matching entries.", example: 1280 }),
  category: topValuesSchema("action categories"),
  action: topValuesSchema("actions"),
  actor: actorValueSchema.array().meta({
    description: "The most common actors, most frequent first. `value` is the ID of the actor.",
  }),
  outcome: topValuesSchema("outcomes"),
  severity: topValuesSchema("severities"),
  targetType: topValuesSchema("kinds of resource"),
  ip: topValuesSchema("IP addresses"),
})

export const getAuditLogFacetsHandler = new Hono().get(
  "/facets",
  describeRoute({
    summary: "Get the top audit log values",
    description: `Returns the most common values of the main fields among matching entries, up to ${LIMIT} per field, and how many entries match. Takes the same filters as listing audit logs.\n\n**Required roles:** admin.`,
    tags: ["Audit logs"],
    responses: {
      200: {
        description: "The top values per field.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(facetsSchema)) } },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation, or the KQL query is invalid.",
      }),
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
            sql<string | null>`max(${sql.ref("users.nameEffect")})`.as("nameEffect"),
            sql<string | null>`max(${sql.ref("users.avatarBorder")})`.as("avatarBorder"),
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
