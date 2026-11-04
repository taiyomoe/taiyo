import * as stylex from "@stylexjs/stylex"
import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { activityLogContainers } from "@/features/activity-log/components/activity-log.stylex"
import { FieldRow } from "@/features/activity-log/components/detail/field-row"
import { getCategory } from "@/features/activity-log/lib/activity-log"
import { formatTimestamp } from "@/features/activity-log/lib/format"
import { stringify } from "@/features/activity-log/lib/stringify"

const styles = stylex.create({
  grid: {
    margin: 0,
    columnGap: "1.5rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [activityLogContainers.detailColumns]: "repeat(2, minmax(0, 1fr))",
    },
  },
})

export function EntryFields({
  entry,
  onFilter,
}: {
  entry: AuditLogEntry
  onFilter: (field: string, value: string, negate: boolean) => void
}) {
  const { target, actor, context, request } = entry
  const extras = Object.entries(target ?? {}).filter(([key]) => key !== "type" && key !== "id")
  const { day, time, milliseconds } = formatTimestamp(entry.createdAt)
  const rows: Array<{ field: string; value: string; filterable: boolean } | null> = [
    { field: "timestamp", value: `${day} ${time}.${milliseconds}`, filterable: false },
    { field: "action", value: entry.action, filterable: true },
    { field: "category", value: getCategory(entry.action), filterable: true },
    { field: "outcome", value: entry.outcome, filterable: true },
    entry.severity === null ? null : { field: "severity", value: entry.severity, filterable: true },
    { field: "actor.type", value: actor.type, filterable: true },
    { field: "actor.id", value: actor.id, filterable: true },
    actor.user === null && actor.displayName === null
      ? null
      : {
          field: "actor",
          value: actor.user?.username ?? actor.displayName ?? actor.id,
          filterable: true,
        },
    target === null ? null : { field: "target.type", value: target.type, filterable: true },
    target === null ? null : { field: "target.id", value: target.id, filterable: true },
    ...extras.map(([key, value]) => ({
      field: `target.${key}`,
      value: stringify(value),
      filterable: typeof value === "string" || typeof value === "number",
    })),
    entry.reason === null ? null : { field: "reason", value: entry.reason, filterable: true },
    context.ip === null ? null : { field: "ip", value: context.ip, filterable: true },
    context.userAgent === null
      ? null
      : { field: "userAgent", value: context.userAgent, filterable: true },
    context.requestId === null
      ? null
      : { field: "requestId", value: context.requestId, filterable: true },
    request === null ? null : { field: "method", value: request.method, filterable: true },
    request === null ? null : { field: "path", value: request.path, filterable: true },
    request?.status === null || request === null
      ? null
      : { field: "status", value: String(request.status), filterable: true },
    request?.duration === null || request === null
      ? null
      : { field: "duration", value: request.duration, filterable: false },
    { field: "id", value: entry.id, filterable: true },
  ]

  return (
    <dl sx={styles.grid}>
      {rows
        .filter((row) => row !== null)
        .map((row) => (
          <FieldRow
            field={row.field}
            filterable={row.filterable}
            key={row.field}
            onFilter={onFilter}
            value={row.value}
          />
        ))}
    </dl>
  )
}
