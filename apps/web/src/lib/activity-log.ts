import {
  AUDIT_LOG_HISTOGRAM_INTERVAL_MS,
  AUDIT_LOG_HISTOGRAM_INTERVALS,
  type AuditLogHistogramInterval,
  KQL_MAX_LENGTH,
  quoteKqlValue,
} from "@taiyomoe/audit/query"
import { z } from "zod"
import type { AuditLogEntry, AuditLogScope } from "@/lib/queries/audit-logs"
import type { Session } from "@/lib/queries/session"

export const DEFAULT_FROM = "now-24h"

export const DEFAULT_TO = "now"

export const ACTIVITY_LOG_PER_PAGE = 50

export const FILTER_OPERATORS = [
  "is",
  "is_not",
  "is_one_of",
  "is_not_one_of",
  "exists",
  "not_exists",
] as const

export type FilterOperator = (typeof FILTER_OPERATORS)[number]

const logFilterSchema = z.object({
  field: z.string().min(1).max(100),
  operator: z.enum(FILTER_OPERATORS),
  values: z.array(z.string().max(500)).max(50).default([]),
  disabled: z.boolean().optional(),
})

export type LogFilter = z.output<typeof logFilterSchema>

export const getFilterKey = ({ field, operator, values }: LogFilter) =>
  JSON.stringify([field, operator, values])

const uniqueFilters = (filters: readonly LogFilter[]) => {
  const seen = new Set<string>()

  return filters.filter((filter) => {
    const key = getFilterKey(filter)

    if (seen.has(key)) {
      return false
    }

    seen.add(key)

    return true
  })
}

export const DEFAULT_FILTERS: readonly LogFilter[] = [
  { field: "category", operator: "is_not", values: ["audit"] },
]

export const isDefaultFilters = (filters: readonly LogFilter[]) =>
  JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS)

export const REFRESH_INTERVALS = ["5s", "10s", "30s", "1m", "5m", "15m", "1h"] as const

export type RefreshInterval = (typeof REFRESH_INTERVALS)[number]

export const REFRESH_INTERVAL_MS: Record<RefreshInterval, number> = {
  "5s": 5000,
  "10s": 10_000,
  "30s": 30_000,
  "1m": 60_000,
  "5m": 300_000,
  "15m": 900_000,
  "1h": 3_600_000,
}

export const activityLogSearchSchema = z.object({
  q: z.string().max(KQL_MAX_LENGTH).optional().catch(undefined),
  from: z.string().max(100).optional().catch(undefined),
  to: z.string().max(100).optional().catch(undefined),
  filters: z.array(logFilterSchema).max(30).transform(uniqueFilters).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
  sort: z.enum(["asc"]).optional().catch(undefined),
  refresh: z.enum(REFRESH_INTERVALS).optional().catch(undefined),
  grouping: z.enum(["off"]).optional().catch(undefined),
})

export type ActivityLogSearch = z.output<typeof activityLogSearchSchema>

export const canReadActivityLog = (user: Session["user"]) =>
  user.banned !== true && user.role === "ADMIN"

export const NEGATED_OPERATORS: ReadonlySet<FilterOperator> = new Set([
  "is_not",
  "is_not_one_of",
  "not_exists",
])

export const isMultiValueOperator = (operator: FilterOperator) =>
  operator === "is_one_of" || operator === "is_not_one_of"

export const isValuelessOperator = (operator: FilterOperator) =>
  operator === "exists" || operator === "not_exists"

const NEGATIONS: Record<FilterOperator, FilterOperator> = {
  is: "is_not",
  is_not: "is",
  is_one_of: "is_not_one_of",
  is_not_one_of: "is_one_of",
  exists: "not_exists",
  not_exists: "exists",
}

export const negateOperator = (operator: FilterOperator) => NEGATIONS[operator]

const toClause = ({ field, operator, values }: LogFilter) => {
  if (isValuelessOperator(operator)) {
    return `${field}: *`
  }

  const quoted = values.map(quoteKqlValue)

  return isMultiValueOperator(operator)
    ? `${field}: (${quoted.join(" or ")})`
    : `${field}: ${quoted[0] ?? '""'}`
}
const filterToKql = (filter: LogFilter) =>
  NEGATED_OPERATORS.has(filter.operator) ? `not ${toClause(filter)}` : toClause(filter)

export const enableFilter = ({ field, operator, values }: LogFilter): LogFilter => ({
  field,
  operator,
  values,
})

export const QUERY_OFFSET = 1

export const buildQuery = (query: string, filters: readonly LogFilter[]) =>
  [
    ...(query.trim() === "" ? [] : [`(${query})`]),
    ...filters
      .filter((filter) => filter.disabled !== true)
      .filter((filter) => isValuelessOperator(filter.operator) || filter.values.length > 0)
      .map((filter) => `(${filterToKql(filter)})`),
  ].join(" and ")

const TARGET_BUCKETS = 60

export const pickHistogramInterval = (spanMs: number): AuditLogHistogramInterval =>
  AUDIT_LOG_HISTOGRAM_INTERVALS.find(
    (interval) => spanMs / AUDIT_LOG_HISTOGRAM_INTERVAL_MS[interval] <= TARGET_BUCKETS,
  ) ?? "1y"

export const getCategory = (action: string) => action.split(".")[0] ?? action

export const getTargetLabel = ({ preview, target }: AuditLogEntry) => {
  if (typeof preview?.label === "string") {
    return preview.label
  }

  if (typeof target?.title === "string") {
    return target.title
  }

  return typeof target?.name === "string" ? target.name : (target?.id ?? "")
}

export type LogGroup = {
  count: number
  first: string
  last: string
  targets: number
  entry: AuditLogEntry
}

export const toSingleGroup = (entry: AuditLogEntry): LogGroup => ({
  count: 1,
  first: entry.createdAt,
  last: entry.createdAt,
  targets: entry.target === null ? 0 : 1,
  entry,
})

const getGroupFilters = ({ entry }: LogGroup): LogFilter[] => [
  { field: "actor.id", operator: "is", values: [entry.actor.id] },
  { field: "action", operator: "is", values: [entry.action] },
  { field: "outcome", operator: "is", values: [entry.outcome] },
  ...(entry.actor.id === "anonymous"
    ? [
        entry.context.ip === null
          ? { field: "ip", operator: "not_exists" as const, values: [] }
          : { field: "ip", operator: "is" as const, values: [entry.context.ip] },
      ]
    : []),
]

export const getGroupRange = ({ first, last }: LogGroup) => ({
  from: first,
  to: new Date(new Date(last).getTime() + 1).toISOString(),
})

export const getGroupScope = (scope: AuditLogScope, group: LogGroup): AuditLogScope => ({
  q: buildQuery(scope.q, getGroupFilters(group)),
  ...getGroupRange(group),
})

export const getGroupViewFilters = (filters: readonly LogFilter[], group: LogGroup) => [
  ...filters,
  ...getGroupFilters(group),
]
