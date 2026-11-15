import * as stylex from "@stylexjs/stylex"
import { ChevronRight } from "@taiyomoe/ui/components/icons"
import { TableCell, TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { AuditLogScope } from "@/features/activity-log/api/audit-logs"
import type { LogTableProps } from "@/features/activity-log/components/log-table"
import type { LogGroup } from "@/features/activity-log/lib/activity-log"
import { LogEntryDetail } from "@/features/activity-log/components/log-entry-detail"
import { ActionCell } from "@/features/activity-log/components/table/action-cell"
import { ActorCell } from "@/features/activity-log/components/table/actor-cell"
import { GroupEntries } from "@/features/activity-log/components/table/group-entries"
import { SeverityCell } from "@/features/activity-log/components/table/severity-cell"
import { TargetCell } from "@/features/activity-log/components/table/target-cell"
import { TimeCell } from "@/features/activity-log/components/table/time-cell"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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
  detailCell: {
    padding: 0,
    backgroundColor: colors.muted,
  },
  groupCell: {
    paddingInlineStart: "2.75rem",
  },
})

export function LogRow({
  group,
  detailId,
  isOpen,
  scope,
  sort,
  onToggle,
  onFilter,
  onViewGroup,
}: {
  group: LogGroup
  detailId: string
  isOpen: boolean
  scope: AuditLogScope
  sort: "asc" | "desc"
  onToggle: () => void
  onFilter: LogTableProps["onFilter"]
  onViewGroup: LogTableProps["onViewGroup"]
}) {
  const { entry } = group
  const grouped = group.count > 1

  return (
    <>
      <TableRow
        onClick={(event) => {
          if (
            window.getSelection()?.toString() === "" &&
            event.target instanceof Element &&
            event.target.closest("button, a") === null
          ) {
            onToggle()
          }
        }}
        sx={[styles.row, isOpen && styles.rowOpen]}
      >
        <TableCell>
          <button
            aria-controls={detailId}
            aria-expanded={isOpen}
            aria-label={isOpen ? m.activity_collapse() : m.activity_expand()}
            onClick={onToggle}
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
          <TimeCell group={group} />
        </TableCell>
        <TableCell>
          <ActorCell entry={entry} />
        </TableCell>
        <TableCell>
          <ActionCell group={group} />
        </TableCell>
        <TableCell>
          <TargetCell group={group} />
        </TableCell>
        <TableCell>
          <SeverityCell severity={entry.severity} />
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
    </>
  )
}
