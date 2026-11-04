import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { detailStyles } from "@/features/activity-log/components/detail/detail-styles"
import { stringify } from "@/features/activity-log/lib/stringify"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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
  note: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

export function EntryChanges({
  changes,
}: {
  changes: ReadonlyArray<{ field: string; before: unknown; after: unknown }>
}) {
  if (changes.length === 0) {
    return <p sx={styles.note}>{m.activity_detail_no_changes()}</p>
  }

  return (
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
            <th scope="row" sx={[styles.changesCell, detailStyles.field]}>
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
  )
}
