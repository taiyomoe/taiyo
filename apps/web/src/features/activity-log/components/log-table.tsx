import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Table, TableBody, TableCell, TableRow } from "@taiyomoe/ui/components/ui/table"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { range } from "remeda"
import type { AuditLogScope } from "@/features/activity-log/api/audit-logs"
import type { LogGroup } from "@/features/activity-log/lib/activity-log"
import { LogRow } from "@/features/activity-log/components/table/log-row"
import { LogTableHead } from "@/features/activity-log/components/table/log-table-head"
import { SkeletonPill, SkeletonText } from "@/features/catalog/components/shared/catalog-skeletons"

const SKELETON_ROWS = 10
const styles = stylex.create({
  scroller: {
    containerType: "inline-size",
    minWidth: 0,
    overflowX: "auto",
  },
  table: {
    tableLayout: "fixed",
    minWidth: "52rem",
    width: "100%",
  },
  tableNested: {
    minWidth: "49rem",
  },
  // Each placeholder takes the box of the cell it stands for.
  toggle: {
    borderRadius: radius.md,
    height: "1.75rem",
    width: "1.75rem",
  },
  stack: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  row: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
  },
  avatar: {
    borderRadius: radius.full,
    flexShrink: 0,
    height: "2rem",
    width: "2rem",
  },
  thumb: {
    borderRadius: radius.md,
    flexShrink: 0,
    height: "2rem",
    width: "2rem",
  },
  smallPill: {
    borderRadius: radius.full,
    height: "1.25rem",
    width: "3.5rem",
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
      <Table
        sx={[styles.table, nested && styles.tableNested]}
        variant={nested ? "default" : "card"}
      >
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

/** The table while its first page loads: the same header, and rows shaped like the real ones. */
export function LogTableSkeleton({ sort }: { sort: "asc" | "desc" }) {
  return (
    <div aria-busy sx={styles.scroller}>
      <Table sx={styles.table} variant="card">
        <LogTableHead nested={false} onSortChange={undefined} sort={sort} />
        <TableBody>
          {range(0, SKELETON_ROWS).map((row) => (
            <TableRow key={row}>
              <TableCell>
                <Skeleton sx={styles.toggle} />
              </TableCell>
              <TableCell>
                <span sx={styles.stack}>
                  <SkeletonText width="5.5rem" />
                  <SkeletonText width="4.5rem" />
                </span>
              </TableCell>
              <TableCell>
                <span sx={styles.row}>
                  <Skeleton sx={styles.avatar} />
                  <span sx={styles.stack}>
                    <SkeletonText width="6rem" />
                    <SkeletonText width="4rem" />
                  </span>
                </span>
              </TableCell>
              <TableCell>
                <span sx={styles.stack}>
                  <SkeletonText width="min(9rem, 90%)" />
                  <span sx={styles.row}>
                    <Skeleton sx={styles.smallPill} />
                    <SkeletonText width="3rem" />
                  </span>
                </span>
              </TableCell>
              <TableCell>
                <span sx={styles.row}>
                  <Skeleton sx={styles.thumb} />
                  <span sx={styles.stack}>
                    <SkeletonText width="min(7rem, 90%)" />
                    <SkeletonText width="min(3.5rem, 60%)" />
                  </span>
                </span>
              </TableCell>
              <TableCell>
                <SkeletonPill width="4.5rem" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
