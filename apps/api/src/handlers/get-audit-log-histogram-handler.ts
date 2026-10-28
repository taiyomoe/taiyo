import {
  AUDIT_LOG_HISTOGRAM_INTERVAL_MS,
  AUDIT_LOG_HISTOGRAM_INTERVALS,
  AUDIT_LOG_MAX_HISTOGRAM_BUCKETS,
  type AuditLogHistogramInterval,
} from "@taiyomoe/audit/query"
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
  toIsoString,
  toQueryIssues,
} from "../utils/audit-logs"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, timeZoneSchema } from "../utils/schemas"

const SQL_INTERVALS: Record<AuditLogHistogramInterval, string> = {
  "1m": "1 minute",
  "5m": "5 minutes",
  "10m": "10 minutes",
  "30m": "30 minutes",
  "1h": "1 hour",
  "3h": "3 hours",
  "12h": "12 hours",
  "1d": "1 day",
  "1w": "1 week",
  "1M": "1 month",
  "1y": "1 year",
}
const CALENDAR_UNITS: Partial<Record<AuditLogHistogramInterval, string>> = {
  "1d": "day",
  "1w": "week",
  "1M": "month",
  "1y": "year",
}
const querySchema = auditLogFilterSchema.extend({
  from: z.iso.datetime().meta({ description: "Start of the histogram, inclusive." }),
  to: z.iso.datetime().meta({ description: "End of the histogram, exclusive." }),
  interval: z.enum(AUDIT_LOG_HISTOGRAM_INTERVALS).meta({
    description: "The width of each bucket. Day, week, month and year buckets follow `tz`.",
    example: "1h",
  }),
  tz: timeZoneSchema.meta({
    description: "IANA time zone that day, week, month and year buckets follow. Default: UTC.",
    example: "Europe/Paris",
  }),
})
const bucketSchema = z.object({
  start: z.iso.datetime().meta({ description: "When the bucket starts." }),
  success: z.int().meta({ description: "Successful actions in the bucket." }),
  failure: z.int().meta({ description: "Failed actions in the bucket." }),
  denied: z.int().meta({ description: "Denied actions in the bucket." }),
})

export const getAuditLogHistogramHandler = new Hono().get(
  "/histogram",
  describeRoute({
    summary: "Count audit logs over time",
    description:
      "Counts matching audit log entries per time bucket, split by outcome. Empty buckets are included, so the series is continuous. Takes the same filters as listing.\n\n**Required roles:** admin.",
    tags: ["Audit logs"],
    responses: {
      200: {
        description: "One bucket per interval between `from` and `to`.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  interval: z.enum(AUDIT_LOG_HISTOGRAM_INTERVALS),
                  total: z.int().meta({ description: "Matching entries across all buckets." }),
                  buckets: bucketSchema.array(),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The query parameters or the KQL query failed validation, or the range holds too many buckets.",
      }),
    },
  }),
  withAuth("auditLog.read"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { interval, tz, ...filters } = c.var.query
    const span = new Date(filters.to).getTime() - new Date(filters.from).getTime()

    if (
      span <= 0 ||
      span / AUDIT_LOG_HISTOGRAM_INTERVAL_MS[interval] > AUDIT_LOG_MAX_HISTOGRAM_BUCKETS
    ) {
      return c.fail("VALIDATION_ERROR", [
        {
          code: "too_many_buckets",
          path: ["interval"],
          message: `Pick a wider interval: the range would need more than ${AUDIT_LOG_MAX_HISTOGRAM_BUCKETS} buckets.`,
        },
      ])
    }

    let filtered: ReturnType<typeof filterAuditLogs>

    try {
      filtered = filterAuditLogs(fromAuditLogs(db), filters)
    } catch (error) {
      if (error instanceof AuditLogQueryError) {
        return c.fail("VALIDATION_ERROR", toQueryIssues(error))
      }

      throw error
    }

    const step = sql`${SQL_INTERVALS[interval]}::interval`
    const unit = CALENDAR_UNITS[interval]
    const toLocal = (timestamp: RawBuilder<unknown>) =>
      sql`((${timestamp} at time zone 'UTC') at time zone ${tz})`
    const fromLocal = (local: RawBuilder<unknown>) =>
      sql`((${local} at time zone ${tz}) at time zone 'UTC')`
    const fromParam = sql`(${filters.from}::timestamptz at time zone 'UTC')`
    const toParam = sql`(${filters.to}::timestamptz at time zone 'UTC')`
    const bucketOf = (timestamp: RawBuilder<unknown>) =>
      unit === undefined
        ? sql`date_bin(${step}, ${timestamp}, timestamp '2000-01-01')`
        : fromLocal(sql`date_trunc(${unit}, ${toLocal(timestamp)})`)
    const series =
      unit === undefined
        ? sql`generate_series(${bucketOf(fromParam)}, ${toParam} - interval '1 microsecond', ${step})`
        : sql`generate_series(date_trunc(${unit}, ${toLocal(fromParam)}), ${toLocal(toParam)} - interval '1 microsecond', ${step})`
    const counts = filtered
      .select([
        bucketOf(sql.ref("auditLogs.createdAt")).as("start"),
        sql<number>`count(*) filter (where ${sql.ref("auditLogs.outcome")} = 'success')`.as(
          "success",
        ),
        sql<number>`count(*) filter (where ${sql.ref("auditLogs.outcome")} = 'failure')`.as(
          "failure",
        ),
        sql<number>`count(*) filter (where ${sql.ref("auditLogs.outcome")} = 'denied')`.as(
          "denied",
        ),
      ])
      .groupBy(sql`1`)
    const { rows } = await sql<{
      start: string
      success: number
      failure: number
      denied: number
    }>`
      select
        ${toIsoString(sql.ref("buckets.start"))} as start,
        coalesce(counts.success, 0)::int as success,
        coalesce(counts.failure, 0)::int as failure,
        coalesce(counts.denied, 0)::int as denied
      from (
        select ${unit === undefined ? sql.ref("series") : fromLocal(sql.ref("series"))} as start
        from ${series} as series
      ) as buckets
      left join (${counts}) as counts on counts.start = buckets.start
      order by buckets.start
    `.execute(db)

    return c.ok({
      interval,
      total: rows.reduce((sum, row) => sum + row.success + row.failure + row.denied, 0),
      buckets: rows,
    })
  },
)
