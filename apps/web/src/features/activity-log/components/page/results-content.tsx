import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { AuditLogScope } from "@/features/activity-log/api/audit-logs"
import type { UpdateSearch } from "@/features/activity-log/hooks/use-activity-log"
import type { LogGroup } from "@/features/activity-log/lib/activity-log"
import { LogTable } from "@/features/activity-log/components/log-table"
import { pageStyles } from "@/features/activity-log/components/page/page-styles"
import { ResultsEmpty } from "@/features/activity-log/components/page/results-empty"
import { CardNote } from "@/features/dashboard/components/overview/card-note"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  skeletons: {
    padding: "1.5rem",
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  skeletonRow: {
    borderRadius: radius.md,
    height: "2.75rem",
  },
})

export function ResultsContent({
  blocked,
  query,
  rows,
  scope,
  sort,
  span,
  stale,
  onFilter,
  onUpdate,
  onViewGroup,
}: {
  blocked: boolean
  query: string
  rows: readonly LogGroup[] | undefined
  scope: AuditLogScope | null
  sort: "asc" | "desc"
  span: number
  stale: boolean
  onFilter: (field: string, value: string, negate: boolean) => void
  onUpdate: UpdateSearch
  onViewGroup: (group: LogGroup) => void
}) {
  if (blocked) {
    return <CardNote>{m.activity_fix_query()}</CardNote>
  }

  if (rows?.length === 0) {
    return <ResultsEmpty onUpdate={onUpdate} query={query} span={span} />
  }

  if (rows !== undefined && scope !== null) {
    return (
      <div aria-busy={stale} sx={pageStyles.stale}>
        <LogTable
          groups={rows}
          onFilter={onFilter}
          onSortChange={(next) => {
            onUpdate({ sort: next === "asc" ? "asc" : undefined })
          }}
          onViewGroup={onViewGroup}
          scope={scope}
          sort={sort}
        />
      </div>
    )
  }

  return (
    <div sx={styles.skeletons}>
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} sx={styles.skeletonRow} />
      ))}
    </div>
  )
}
