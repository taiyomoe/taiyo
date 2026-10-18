import * as stylex from "@stylexjs/stylex"
import { ArrowUpDown, ChevronRight } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@taiyomoe/ui/components/ui/table"
import { colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Fragment, useState } from "react"
import {
  ActorAvatar,
  getCategoryTone,
  TargetThumb,
} from "@/components/dashboard/activity-log/entity-avatar"
import { formatCount, formatTimestamp } from "@/components/dashboard/activity-log/format"
import { LogEntryDetail } from "@/components/dashboard/activity-log/log-entry-detail"
import {
  getCategory,
  getGroupScope,
  getTargetLabel,
  type LogGroup,
  toSingleGroup,
} from "@/lib/activity-log"
import {
  type AuditLogEntry,
  type AuditLogScope,
  auditLogsQueryOptions,
} from "@/lib/queries/audit-logs"
import { m } from "@/paraglide/messages"

const OUTCOME_BADGES = {
  success: "success",
  failure: "warning",
  denied: "error",
} as const
const OUTCOME_LABELS = {
  success: m.activity_outcome_success,
  failure: m.activity_outcome_failure,
  denied: m.activity_outcome_denied,
}
const SEVERITY_LABELS = {
  low: m.activity_severity_low,
  medium: m.activity_severity_medium,
  high: m.activity_severity_high,
  critical: m.activity_severity_critical,
}
const SEVERITY_TONES = {
  low: colors.mutedForeground,
  medium: colors.info,
  high: colors.warning,
  critical: colors.destructive,
}
const styles = stylex.create({
  scroller: {
    containerType: "inline-size",
    minWidth: 0,
    overflowX: "auto",
  },
  table: {
    tableLayout: "fixed",
    minWidth: "46rem",
    width: "100%",
  },
  colToggle: { width: "2.75rem" },
  colTime: { width: "7rem" },
  colActor: { width: "11.5rem" },
  colAction: { width: "15.5rem" },
  colSeverity: { width: "6.25rem" },
  srOnly: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: "1px",
    width: "1px",
  },
  sortButton: {
    font: "inherit",
    padding: 0,
    borderWidth: 0,
    gap: "0.375rem",
    alignItems: "center",
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    display: "inline-flex",
  },
  row: {
    cursor: "pointer",
  },
  rowOpen: {
    backgroundColor: colors.muted,
  },
  toggle: {
    borderRadius: radius.md,
    borderWidth: 0,
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.chipHover,
    },
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "inline-flex",
    justifyContent: "center",
    outlineColor: colors.ring,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    height: "1.75rem",
    width: "1.75rem",
  },
  chevron: {
    transitionDuration: motion.enter,
    transitionProperty: "rotate",
    transitionTimingFunction: motion.easeOut,
  },
  chevronOpen: {
    rotate: "90deg",
  },
  time: {
    display: "flex",
    flexDirection: "column",
    whiteSpace: "nowrap",
  },
  timeMain: {
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
  },
  timeMs: {
    color: colors.mutedForeground,
  },
  muted: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
  actor: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },

  actorText: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  ellipsis: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  action: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  actionMeta: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  actionName: {
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  target: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  targetId: {
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  severity: {
    gap: "0.5rem",
    alignItems: "center",
    display: "inline-flex",
    fontSize: "0.8125rem",
    whiteSpace: "nowrap",
  },
  dot: (color: string) => ({
    borderRadius: radius.full,
    backgroundColor: color,
    flexShrink: 0,
    height: "0.5rem",
    width: "0.5rem",
  }),
  resource: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  category: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "inline-flex",
    fontSize: "0.75rem",
  },
  categoryDot: (color: string) => ({
    borderRadius: radius.full,
    backgroundColor: color,
    flexShrink: 0,
    height: "0.375rem",
    width: "0.375rem",
  }),
  detailCell: {
    padding: 0,
    backgroundColor: colors.muted,
  },
  groupCell: {
    paddingInlineStart: "2.75rem",
  },
  tableNested: {
    minWidth: "43rem",
  },
  actionLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  count: {
    borderRadius: radius.full,
    paddingBlock: "0.0625rem",
    paddingInline: "0.4375rem",
    backgroundColor: `color-mix(in srgb, ${colors.primary} 14%, transparent)`,
    color: colors.primary,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
  },
  group: {
    display: "flex",
    flexDirection: "column",
  },
  groupFooter: {
    gap: "0.75rem",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  groupNote: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  groupLoading: {
    padding: "1rem",
  },
  groupSkeleton: {
    borderRadius: radius.md,
    height: "2.75rem",
  },
})
const describeActorDetail = (actor: AuditLogEntry["actor"], ip: string | null) => {
  if (actor.impersonating !== null) {
    return m.activity_impersonating()
  }

  if (actor.user !== null) {
    return `@${actor.user.username}`
  }

  return actor.type === "user" ? (ip ?? actor.type) : actor.type
}
const GROUP_PAGE = 100

type LogTableProps = {
  groups: readonly LogGroup[]
  scope: AuditLogScope
  sort: "asc" | "desc"
  nested?: boolean
  onSortChange?: (sort: "asc" | "desc") => void
  onFilter: (field: string, value: string, negate: boolean) => void
  onViewGroup: (group: LogGroup) => void
}

export function LogTable({
  groups,
  scope,
  sort,
  nested = false,
  onSortChange,
  onFilter,
  onViewGroup,
}: LogTableProps) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set())
  const toggle = (key: string) => {
    setOpen((current) => {
      const next = new Set(current)

      if (!next.delete(key)) {
        next.add(key)
      }

      return next
    })
  }

  return (
    <div sx={styles.scroller}>
      <Table sx={[styles.table, nested && styles.tableNested]}>
        <TableHeader sx={nested && styles.srOnly}>
          <TableRow>
            <TableHead sx={styles.colToggle}>
              <span sx={styles.srOnly}>{m.activity_column_details()}</span>
            </TableHead>
            <TableHead aria-sort={sort === "desc" ? "descending" : "ascending"} sx={styles.colTime}>
              <button
                disabled={onSortChange === undefined}
                onClick={() => {
                  onSortChange?.(sort === "desc" ? "asc" : "desc")
                }}
                sx={styles.sortButton}
                type="button"
              >
                {m.activity_column_time()}
                <ArrowUpDown size={14} />
              </button>
            </TableHead>
            <TableHead sx={styles.colActor}>{m.activity_column_actor()}</TableHead>
            <TableHead sx={styles.colAction}>{m.activity_column_action()}</TableHead>
            <TableHead>{m.activity_column_target()}</TableHead>
            <TableHead sx={styles.colSeverity}>{m.activity_column_severity()}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => {
            const { entry } = group
            const key = `${entry.id}-${group.count}`
            const isOpen = open.has(key)
            const { day, time, milliseconds } = formatTimestamp(group.last)
            const detailId = `entry-${key}`
            const grouped = group.count > 1

            return (
              <Fragment key={key}>
                <TableRow
                  onClick={(event) => {
                    if (
                      window.getSelection()?.toString() === "" &&
                      event.target instanceof Element &&
                      event.target.closest("button") === null
                    ) {
                      toggle(key)
                    }
                  }}
                  sx={[styles.row, isOpen && styles.rowOpen]}
                >
                  <TableCell>
                    <button
                      aria-controls={detailId}
                      aria-expanded={isOpen}
                      aria-label={isOpen ? m.activity_collapse() : m.activity_expand()}
                      onClick={() => {
                        toggle(key)
                      }}
                      sx={styles.toggle}
                      type="button"
                    >
                      <ChevronRight
                        {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)}
                        size={16}
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <time dateTime={group.last} sx={styles.time}>
                      <span sx={styles.timeMain}>
                        {time}
                        <span sx={styles.timeMs}>.{milliseconds}</span>
                      </span>
                      <span sx={styles.muted}>
                        {grouped
                          ? m.activity_group_from({ time: formatTimestamp(group.first).time })
                          : day}
                      </span>
                    </time>
                  </TableCell>
                  <TableCell>
                    <ActorCell entry={entry} />
                  </TableCell>
                  <TableCell>
                    <div sx={styles.action}>
                      <span sx={styles.actionLine}>
                        <span sx={[styles.actionName, styles.ellipsis]}>{entry.action}</span>
                        {grouped ? (
                          <span
                            aria-label={m.activity_group_count({ count: formatCount(group.count) })}
                            sx={styles.count}
                          >
                            ×{formatCount(group.count)}
                          </span>
                        ) : null}
                      </span>
                      <span sx={styles.actionMeta}>
                        <Badge size="sm" variant={OUTCOME_BADGES[entry.outcome]}>
                          {OUTCOME_LABELS[entry.outcome]()}
                        </Badge>
                        <span sx={styles.category}>
                          <span
                            sx={styles.categoryDot(getCategoryTone(getCategory(entry.action)))}
                          />
                          {getCategory(entry.action)}
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TargetCell group={group} />
                  </TableCell>
                  <TableCell>
                    {entry.severity === null ? null : (
                      <span sx={styles.severity}>
                        <span sx={styles.dot(SEVERITY_TONES[entry.severity])} />
                        {SEVERITY_LABELS[entry.severity]()}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
                {isOpen ? (
                  <TableRow id={detailId}>
                    <TableCell colSpan={6} sx={[styles.detailCell, grouped && styles.groupCell]}>
                      {grouped ? (
                        <GroupEntries
                          group={group}
                          onFilter={onFilter}
                          onViewGroup={onViewGroup}
                          scope={scope}
                          sort={sort}
                        />
                      ) : (
                        <LogEntryDetail entry={entry} onFilter={onFilter} />
                      )}
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function TargetCell({ group: { entry, count, targets } }: { group: LogGroup }) {
  if (entry.target === null) {
    return <span sx={styles.muted}>—</span>
  }

  const many = count > 1 && targets > 1

  return (
    <div sx={styles.resource}>
      <TargetThumb
        category={getCategory(entry.action)}
        preview={many ? null : entry.preview}
        targetType={entry.target.type}
      />
      <div sx={styles.target}>
        <span sx={[styles.ellipsis, styles.targetId]}>
          {many ? m.activity_group_targets({ count: formatCount(targets) }) : getTargetLabel(entry)}
        </span>
        <span sx={[styles.muted, styles.ellipsis]}>{entry.target.type}</span>
      </div>
    </div>
  )
}

function GroupEntries({
  group,
  scope,
  sort,
  onFilter,
  onViewGroup,
}: {
  group: LogGroup
  scope: AuditLogScope
  sort: "asc" | "desc"
  onFilter: LogTableProps["onFilter"]
  onViewGroup: LogTableProps["onViewGroup"]
}) {
  const groupScope = getGroupScope(scope, group)
  const query = useQuery(auditLogsQueryOptions(groupScope, { page: 1, perPage: GROUP_PAGE, sort }))

  if (query.data === undefined) {
    return (
      <div sx={styles.groupLoading}>
        {query.isError ? (
          <p sx={styles.groupNote}>{m.activity_error()}</p>
        ) : (
          <Skeleton sx={styles.groupSkeleton} />
        )}
      </div>
    )
  }

  return (
    <div sx={styles.group}>
      <LogTable
        groups={query.data.entries.map(toSingleGroup)}
        nested
        onFilter={onFilter}
        onViewGroup={onViewGroup}
        scope={groupScope}
        sort={sort}
      />
      <div sx={styles.groupFooter}>
        <p sx={styles.groupNote}>
          {group.count > GROUP_PAGE
            ? m.activity_group_partial({
                shown: formatCount(GROUP_PAGE),
                count: formatCount(group.count),
              })
            : m.activity_group_all({ count: formatCount(group.count) })}
        </p>
        <Button
          onClick={() => {
            onViewGroup(group)
          }}
          size="sm"
          variant="outline"
        >
          {m.activity_group_view()}
        </Button>
      </div>
    </div>
  )
}

function ActorCell({ entry: { actor, context } }: { entry: AuditLogEntry }) {
  const name =
    actor.id === "anonymous"
      ? m.activity_anonymous()
      : (actor.user?.displayUsername ?? actor.displayName ?? actor.id)

  return (
    <div sx={styles.actor}>
      <ActorAvatar actor={actor} />
      <span sx={styles.actorText}>
        <span sx={styles.ellipsis}>{name}</span>
        <span sx={[styles.muted, styles.ellipsis]}>{describeActorDetail(actor, context.ip)}</span>
      </span>
    </div>
  )
}
