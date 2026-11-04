import * as stylex from "@stylexjs/stylex"
import { ArrowUpDown } from "@taiyomoe/ui/components/icons"
import { TableHead, TableHeader, TableRow } from "@taiyomoe/ui/components/ui/table"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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
})

export function LogTableHead({
  sort,
  nested,
  onSortChange,
}: {
  sort: "asc" | "desc"
  nested: boolean
  onSortChange: ((sort: "asc" | "desc") => void) | undefined
}) {
  return (
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
  )
}
