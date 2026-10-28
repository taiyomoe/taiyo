import { auditLogAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { paginationQuerySchema } from "@taiyomoe/schemas"
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
  toIsoString,
  toQueryIssues,
} from "../utils/audit-logs"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const GROUP_GAP = "30 minutes"
const querySchema = paginationQuerySchema.extend(auditLogFilterSchema.shape).extend({
  sort: z
    .enum(["desc", "asc"])
    .default("desc")
    .meta({ description: "`desc` for the latest groups first (default), `asc` for the oldest." }),
})
const groupSchema = z.object({
  count: z.int().meta({ description: "How many entries the group holds." }),
  first: z.iso.datetime().meta({ description: "When the oldest entry was recorded." }),
  last: z.iso.datetime().meta({ description: "When the latest entry was recorded." }),
  targets: z.int().meta({ description: "How many distinct resources the entries touched." }),
  entry: auditLogSchema.meta({ description: "The latest entry of the group." }),
})
const metaSchema = z.object({
  page: z.int(),
  perPage: z.int(),
  total: z.int().meta({ description: "How many groups match." }),
  entries: z.int().meta({ description: "How many entries the matching groups hold." }),
})

export const listAuditLogGroupsHandler = new Hono().get(
  "/groups",
  describeRoute({
    summary: "List audit logs, grouped",
    description: `Lists matching entries grouped into runs: consecutive entries by the same actor with the same action and outcome, each recorded within ${GROUP_GAP} of the previous one. Signed-out actors are grouped per IP address. Takes the same filters as listing, and is recorded the same way.\n\n**Required roles:** admin.`,
    tags: ["Audit logs"],
    responses: {
      200: {
        description: "Matching groups, with the latest entry of each.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(groupSchema.array(), metaSchema)),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters, or the KQL query, failed validation." }),
    },
  }),
  audited(auditLogAudit.LIST),
  withAuth("auditLog.read"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, sort, ...filters } = c.var.query
    let filtered: ReturnType<typeof filterAuditLogs>

    try {
      filtered = filterAuditLogs(fromAuditLogs(db), filters)
    } catch (error) {
      if (error instanceof AuditLogQueryError) {
        return c.fail("VALIDATION_ERROR", toQueryIssues(error))
      }

      throw error
    }

    const base = filtered.select([
      "auditLogs.id",
      "auditLogs.createdAt",
      "auditLogs.action",
      "auditLogs.outcome",
      "auditLogs.targetId",
      sql<string>`case when ${sql.ref("auditLogs.actorId")} = 'anonymous' then 'anonymous:' || coalesce(${sql.ref("auditLogs.ip")}, '') else ${sql.ref("auditLogs.actorId")} end`.as(
        "actorKey",
      ),
    ])
    const order = sort === "desc" ? sql`"lastAt" desc, "latestId" desc` : sql`"firstAt", "latestId"`
    const {
      rows: [summary],
    } = await sql<{
      totalGroups: number
      totalEntries: number
      page: Array<{ count: number; first: string; last: string; targets: number; latestId: string }>
    }>`
      with base as (${base}),
      marked as (
        select *, case
          when "createdAt" - lag("createdAt") over (partition by "actorKey", action, outcome order by "createdAt") <= ${GROUP_GAP}::interval
          then 0 else 1 end as starts
        from base
      ),
      runs as (
        select *, sum(starts) over (partition by "actorKey", action, outcome order by "createdAt", id rows unbounded preceding) as run
        from marked
      ),
      groups as (
        select
          count(*)::int as count,
          min("createdAt") as "firstAt",
          max("createdAt") as "lastAt",
          ${toIsoString(sql`min("createdAt")`)} as first,
          ${toIsoString(sql`max("createdAt")`)} as last,
          count(distinct "targetId")::int as targets,
          (array_agg(id order by "createdAt" desc, id desc))[1] as "latestId"
        from runs
        group by "actorKey", action, outcome, run
      )
      select
        (select count(*)::int from groups) as "totalGroups",
        (select coalesce(sum(count), 0)::int from groups) as "totalEntries",
        coalesce(
          (
            select json_agg(json_build_object('count', count, 'first', first, 'last', last, 'targets', targets, 'latestId', "latestId") order by ${order})
            from (select * from groups order by ${order} limit ${perPage} offset ${(page - 1) * perPage}) as page
          ),
          '[]'
        ) as page
    `.execute(db)
    const groups = summary?.page ?? []
    const entries =
      groups.length === 0
        ? []
        : await selectAuditLogs(
            fromAuditLogs(db).where(
              "auditLogs.id",
              "in",
              groups.map((group) => group.latestId),
            ),
          ).execute()
    const byId = new Map(
      (await withPreviews(db, entries.map(toAuditLog))).map((entry) => [entry.id, entry]),
    )

    return c.ok(
      groups.flatMap(({ latestId, ...group }) => {
        const entry = byId.get(latestId)

        return entry === undefined ? [] : [{ ...group, entry }]
      }),
      {
        page,
        perPage,
        total: summary?.totalGroups ?? 0,
        entries: summary?.totalEntries ?? 0,
      },
    )
  },
)
