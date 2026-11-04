import * as stylex from "@stylexjs/stylex"
import { Table, TableBody } from "@taiyomoe/ui/components/ui/table"
import { useState } from "react"
import type { AuditLogScope } from "@/features/activity-log/api/audit-logs"
import type { LogGroup } from "@/features/activity-log/lib/activity-log"
import { LogRow } from "@/features/activity-log/components/table/log-row"
import { LogTableHead } from "@/features/activity-log/components/table/log-table-head"

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
  tableNested: {
    minWidth: "43rem",
  },
})

export type LogTableProps = {
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
        <LogTableHead nested={nested} onSortChange={onSortChange} sort={sort} />
        <TableBody>
          {groups.map((group) => {
            const key = `${group.entry.id}-${group.count}`

            return (
              <LogRow
                detailId={`entry-${key}`}
                group={group}
                isOpen={open.has(key)}
                key={key}
                onFilter={onFilter}
                onToggle={() => {
                  toggle(key)
                }}
                onViewGroup={onViewGroup}
                scope={scope}
                sort={sort}
              />
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
