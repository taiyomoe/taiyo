import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReleasePlan } from "@/features/uploads/lib/chapter-batch/release"
import type { RowIssues, UploadRow } from "@/features/uploads/lib/chapter-batch/upload-rows"
import { ChapterTableRow } from "@/features/uploads/components/upload/chapter-table-row"
import { uploadStyles } from "@/features/uploads/components/upload/upload-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  cardHeader: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  count: {
    borderRadius: radius.full,
    paddingInline: "0.5rem",
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    lineHeight: "1.25rem",
    marginInlineStart: "0.5rem",
  },
  table: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  tableHead: {
    gap: "0.75rem",
    color: colors.mutedForeground,
    display: { default: "none", [breakpoints.md]: "grid" },
    fontSize: "0.75rem",
    fontWeight: 600,
    gridTemplateColumns: "6rem 5.5rem minmax(0, 1fr) 6rem 2rem 2rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    paddingBottom: "0.5rem",
  },
})

export function ChapterTable({
  rows,
  issues,
  plan,
  order,
  template,
  attempted,
  onRowChange,
  onEditPages,
  onRemove,
  onClear,
}: {
  rows: UploadRow[]
  issues: Map<string, RowIssues>
  plan: ReleasePlan
  order: Map<string, number>
  template: string
  attempted: boolean
  onRowChange: (key: string, patch: Partial<UploadRow>) => void
  onEditPages: (key: string) => void
  onRemove: (key: string) => void
  onClear: () => void
}) {
  return (
    <section sx={uploadStyles.card}>
      <div sx={styles.cardHeader}>
        <h2 sx={uploadStyles.cardTitle}>
          {m.upload_chapters()}
          <span sx={styles.count}>{rows.length}</span>
        </h2>
        <Button onClick={onClear} size="sm" variant="ghost">
          {m.upload_clear()}
        </Button>
      </div>
      <ol sx={styles.table}>
        <li aria-hidden sx={styles.tableHead}>
          <span>{m.upload_number()}</span>
          <span>{m.upload_volume()}</span>
          <span>{m.upload_chapter_title()}</span>
          <span>{m.upload_pages()}</span>
          <span />
          <span />
        </li>
        {rows.map((row) => (
          <ChapterTableRow
            attempted={attempted}
            issues={issues.get(row.key) ?? { errors: [], warnings: [] }}
            key={row.key}
            onChange={(patch) => {
              onRowChange(row.key, patch)
            }}
            onEditPages={() => {
              onEditPages(row.key)
            }}
            onRemove={() => {
              onRemove(row.key)
            }}
            releaseAt={plan.at(order.get(row.key) ?? 0)}
            row={row}
            template={template}
          />
        ))}
      </ol>
    </section>
  )
}
