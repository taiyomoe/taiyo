import * as stylex from "@stylexjs/stylex"
import { ArrowRight, Check, Copy, FilterIn, FilterOut } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { AuditLogEntry } from "@/lib/queries/audit-logs"
import { ActorAvatar, TargetThumb } from "@/components/dashboard/activity-log/entity-avatar"
import { formatTimestamp } from "@/components/dashboard/activity-log/format"
import { getCategory, getTargetLabel } from "@/lib/activity-log"
import { m } from "@/paraglide/messages"

type DetailRow = { field: string; value: string; filterable: boolean }

const styles = stylex.create({
  panel: {
    padding: "1rem",
    gap: "1rem",
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    insetInlineStart: 0,
    position: "sticky",
    whiteSpace: "normal",
    width: "100cqi",
  },
  summary: {
    gap: "0.875rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  summaryPart: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 1,
    minWidth: 0,
  },
  summaryText: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "min(24rem, 100%)",
    minWidth: 0,
  },
  summaryName: {
    overflow: "hidden",
    fontSize: "0.9375rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  summaryAction: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  summaryArrow: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  grid: {
    margin: 0,
    columnGap: "1.5rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@container (width >= 52rem)": "repeat(2, minmax(0, 1fr))",
    },
  },
  row: {
    gridTemplateAreas: {
      default: '"field actions" "value value"',
      "@container (width >= 36rem)": '"field value actions"',
    },
    alignItems: "center",
    columnGap: "0.75rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) auto",
      "@container (width >= 36rem)": "10rem minmax(0, 1fr) auto",
    },
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    minHeight: "2.375rem",
  },
  field: {
    margin: 0,
    overflow: "hidden",
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    gridColumnEnd: "field",
    gridColumnStart: "field",
    gridRowEnd: "field",
    gridRowStart: "field",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  value: {
    margin: 0,
    paddingBlock: "0.375rem",
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    gridColumnEnd: "value",
    gridColumnStart: "value",
    gridRowEnd: "value",
    gridRowStart: "value",
    overflowWrap: "anywhere",
    maxHeight: "8rem",
    overflowY: "auto",
  },
  actions: {
    gap: "0.125rem",
    display: "flex",
    gridColumnEnd: "actions",
    gridColumnStart: "actions",
    gridRowEnd: "actions",
    gridRowStart: "actions",
    opacity: {
      default: 0,
      [stylex.when.ancestor(":focus-within")]: 1,
      [stylex.when.ancestor(":hover")]: 1,
    },
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
  },
  action: {
    color: colors.mutedForeground,
  },
  changes: {
    borderCollapse: "collapse",
    fontSize: "0.8125rem",
    tableLayout: "fixed",
    width: "100%",
  },
  changesFieldHead: {
    width: "9rem",
  },
  changesHead: {
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    textAlign: "start",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  changesCell: {
    paddingBlock: "0.625rem",
    paddingInline: "0.75rem",
    fontFamily: font.mono,
    overflowWrap: "anywhere",
    textAlign: "start",
    verticalAlign: "top",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  changeValue: {
    display: "block",
    whiteSpace: "pre-wrap",
    maxHeight: "12rem",
    overflowY: "auto",
  },
  before: {
    backgroundColor: `color-mix(in srgb, ${colors.destructive} 8%, transparent)`,
    color: colors.foreground,
    textDecorationColor: `color-mix(in srgb, ${colors.destructive} 60%, transparent)`,
    textDecorationLine: "line-through",
  },
  after: {
    backgroundColor: `color-mix(in srgb, ${colors.success} 10%, transparent)`,
  },
  json: {
    margin: 0,
    padding: "1rem",
    borderRadius: radius.lg,
    overflow: "auto",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
    maxHeight: "28rem",
  },
  note: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})
const stringify = (value: unknown) => {
  if (value === undefined) {
    return ""
  }

  return typeof value === "string" ? value : JSON.stringify(value)
}
const getRows = (entry: AuditLogEntry): DetailRow[] => {
  const { target, actor, context, request } = entry
  const extras = Object.entries(target ?? {}).filter(([key]) => key !== "type" && key !== "id")
  const { day, time, milliseconds } = formatTimestamp(entry.createdAt)
  const rows: Array<DetailRow | null> = [
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

  return rows.filter((row) => row !== null)
}
const getChanges = (entry: AuditLogEntry) => {
  const before = entry.changes?.before
  const after = entry.changes?.after
  const toRecord = (value: unknown): Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value))
      : {}
  const previous = toRecord(before)
  const next = toRecord(after)

  return [...new Set([...Object.keys(previous), ...Object.keys(next)])].map((field) => ({
    field,
    before: previous[field],
    after: next[field],
  }))
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <Button
      aria-label={label}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          setTimeout(() => {
            setCopied(false)
          }, 1500)
        })
      }}
      size="icon-xs"
      sx={styles.action}
      variant="ghost"
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

type LogEntryDetailProps = {
  entry: AuditLogEntry
  onFilter: (field: string, value: string, negate: boolean) => void
}

export function LogEntryDetail({ entry, onFilter }: LogEntryDetailProps) {
  const changes = getChanges(entry)
  const json = JSON.stringify(entry, null, 2)
  const name =
    entry.actor.id === "anonymous"
      ? m.activity_anonymous()
      : (entry.actor.user?.displayUsername ?? entry.actor.displayName ?? entry.actor.id)

  return (
    <div sx={styles.panel}>
      <div sx={styles.summary}>
        <div sx={styles.summaryPart}>
          <ActorAvatar actor={entry.actor} size="2.5rem" />
          <div sx={styles.summaryText}>
            <span sx={styles.summaryName}>{name}</span>
            <span sx={styles.summaryAction}>{entry.action}</span>
          </div>
        </div>
        {entry.target === null ? null : (
          <>
            <ArrowRight {...stylex.props(styles.summaryArrow)} size={18} />
            <div sx={styles.summaryPart}>
              <TargetThumb
                category={getCategory(entry.action)}
                preview={entry.preview}
                size="2.5rem"
                targetType={entry.target.type}
              />
              <div sx={styles.summaryText}>
                <span sx={styles.summaryName}>{getTargetLabel(entry)}</span>
                <span sx={styles.summaryAction}>{entry.target.type}</span>
              </div>
            </div>
          </>
        )}
      </div>
      <Tabs defaultValue="fields">
        <div sx={styles.header}>
          <TabsList>
            <TabsTab value="fields">{m.activity_detail_fields()}</TabsTab>
            <TabsTab value="changes">
              {m.activity_detail_changes({ count: String(changes.length) })}
            </TabsTab>
            <TabsTab value="json">{m.activity_detail_json()}</TabsTab>
          </TabsList>
          <Button
            onClick={() => {
              void navigator.clipboard.writeText(json)
            }}
            size="sm"
            variant="outline"
          >
            <Copy />
            {m.activity_detail_copy_json()}
          </Button>
        </div>
        <TabsPanel value="fields">
          <dl sx={styles.grid}>
            {getRows(entry).map((row) => (
              <div key={row.field} sx={[styles.row, stylex.defaultMarker()]}>
                <dt sx={styles.field}>{row.field}</dt>
                <dd sx={styles.value}>{row.value}</dd>
                <div sx={styles.actions}>
                  {row.filterable ? (
                    <>
                      <Button
                        aria-label={m.activity_filter_for({ value: row.value })}
                        onClick={() => {
                          onFilter(row.field, row.value, false)
                        }}
                        size="icon-xs"
                        sx={styles.action}
                        variant="ghost"
                      >
                        <FilterIn />
                      </Button>
                      <Button
                        aria-label={m.activity_filter_out({ value: row.value })}
                        onClick={() => {
                          onFilter(row.field, row.value, true)
                        }}
                        size="icon-xs"
                        sx={styles.action}
                        variant="ghost"
                      >
                        <FilterOut />
                      </Button>
                    </>
                  ) : null}
                  <CopyButton
                    label={m.activity_copy_value({ field: row.field })}
                    value={row.value}
                  />
                </div>
              </div>
            ))}
          </dl>
        </TabsPanel>
        <TabsPanel value="changes">
          {changes.length === 0 ? (
            <p sx={styles.note}>{m.activity_detail_no_changes()}</p>
          ) : (
            <table sx={styles.changes}>
              <thead>
                <tr>
                  <th scope="col" sx={[styles.changesHead, styles.changesFieldHead]}>
                    {m.activity_detail_field()}
                  </th>
                  <th scope="col" sx={styles.changesHead}>
                    {m.activity_detail_before()}
                  </th>
                  <th scope="col" sx={styles.changesHead}>
                    {m.activity_detail_after()}
                  </th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change) => (
                  <tr key={change.field}>
                    <th scope="row" sx={[styles.changesCell, styles.field]}>
                      {change.field}
                    </th>
                    <td sx={[styles.changesCell, styles.before]}>
                      <span sx={styles.changeValue}>{stringify(change.before)}</span>
                    </td>
                    <td sx={[styles.changesCell, styles.after]}>
                      <span sx={styles.changeValue}>{stringify(change.after)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TabsPanel>
        <TabsPanel value="json">
          <pre sx={styles.json}>{json}</pre>
        </TabsPanel>
      </Tabs>
    </div>
  )
}
