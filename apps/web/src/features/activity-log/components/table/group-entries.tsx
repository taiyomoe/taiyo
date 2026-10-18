import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import type { LogTableProps } from "@/features/activity-log/components/log-table"
import { type AuditLogScope, auditLogsQueryOptions } from "@/features/activity-log/api/audit-logs"
import { LogTable } from "@/features/activity-log/components/log-table"
import {
  getGroupScope,
  type LogGroup,
  toSingleGroup,
} from "@/features/activity-log/lib/activity-log"
import { formatCount } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const GROUP_PAGE = 100
const styles = stylex.create({
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

export function GroupEntries({
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
