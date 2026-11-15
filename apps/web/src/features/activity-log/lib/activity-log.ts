import {
  AUDIT_LOG_HISTOGRAM_INTERVAL_MS,
  AUDIT_LOG_HISTOGRAM_INTERVALS,
  KQL_MAX_LENGTH,
} from "@taiyomoe/audit/query"
import { z } from "zod"
import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { DEFAULT_QUERY } from "@/features/activity-log/lib/kql-query"
import {
  getGroupRange,
  getGroupScope,
  getGroupViewQuery,
  type LogGroup,
  toSingleGroup,
} from "@/features/activity-log/lib/log-groups"

export { DEFAULT_QUERY, getGroupRange, getGroupScope, getGroupViewQuery, toSingleGroup }

export type { LogGroup }

export const DEFAULT_FROM = "now-24h"

export const DEFAULT_TO = "now"

export const ACTIVITY_LOG_PER_PAGE = 50

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
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
  sort: z.enum(["asc"]).optional().catch(undefined),
  refresh: z.enum(REFRESH_INTERVALS).optional().catch(undefined),
  grouping: z.enum(["off"]).optional().catch(undefined),
})

export type ActivityLogSearch = z.output<typeof activityLogSearchSchema>

const TARGET_BUCKETS = 60

export const pickHistogramInterval = (spanMs: number) =>
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
