import type { AuditLogHistogramInterval } from "@taiyomoe/audit/query"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import {
  type AuditLogScope,
  auditLogFacetsQueryOptions,
  auditLogGroupsQueryOptions,
  auditLogHistogramQueryOptions,
  auditLogsQueryOptions,
} from "@/features/activity-log/api/audit-logs"
import { ACTIVITY_LOG_PER_PAGE, toSingleGroup } from "@/features/activity-log/lib/activity-log"
import { getQueryIssue } from "@/features/activity-log/lib/activity-log-search"

export function useActivityLogResults({
  scope,
  interval,
  timeZone,
  grouping,
  page,
  sort,
}: {
  scope: AuditLogScope | null
  interval: AuditLogHistogramInterval
  timeZone: string | null
  grouping: boolean
  page: number
  sort: "asc" | "desc"
}) {
  const enabled = scope !== null && timeZone !== null
  const fallbackScope = { q: "", from: "", to: "" }
  const list = useQuery({
    ...auditLogsQueryOptions(scope ?? fallbackScope, {
      page,
      perPage: ACTIVITY_LOG_PER_PAGE,
      sort,
    }),
    enabled: enabled && !grouping,
  })
  const grouped = useQuery({
    ...auditLogGroupsQueryOptions(scope ?? fallbackScope, {
      page,
      perPage: ACTIVITY_LOG_PER_PAGE,
      sort,
    }),
    enabled: enabled && grouping,
  })
  const results = grouping ? grouped : list
  const rows = useMemo(
    () => (grouping ? grouped.data?.groups : list.data?.entries.map(toSingleGroup)),
    [grouping, grouped.data, list.data],
  )
  const histogram = useQuery({
    ...auditLogHistogramQueryOptions(scope ?? fallbackScope, interval, timeZone ?? "UTC"),
    enabled,
  })
  const facets = useQuery({ ...auditLogFacetsQueryOptions(scope ?? fallbackScope), enabled })
  const total = results.data?.total ?? 0

  return {
    results,
    rows,
    histogram,
    facets,
    total,
    entryCount: grouped.data?.entries ?? list.data?.total ?? 0,
    pageCount: Math.max(1, Math.ceil(total / ACTIVITY_LOG_PER_PAGE)),
    fetching: results.isFetching || histogram.isFetching || facets.isFetching,
    serverIssue: getQueryIssue(results.error) ?? getQueryIssue(histogram.error),
  }
}
