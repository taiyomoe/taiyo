import * as stylex from "@stylexjs/stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { LogGroup } from "@/features/activity-log/lib/activity-log"
import { TargetThumb } from "@/features/activity-log/components/entity-avatar"
import { tableStyles } from "@/features/activity-log/components/table/table-styles"
import { TargetName } from "@/features/activity-log/components/target-name"
import { getCategory } from "@/features/activity-log/lib/activity-log"
import { formatCount } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  target: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  targetId: {
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  resource: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
})

export function TargetCell({ group: { entry, count, targets } }: { group: LogGroup }) {
  if (entry.target === null) {
    return <span sx={tableStyles.muted}>—</span>
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
        <span sx={[tableStyles.ellipsis, styles.targetId]}>
          {many ? (
            m.activity_group_targets({ count: formatCount(targets) })
          ) : (
            <TargetName entry={entry} />
          )}
        </span>
        <span sx={[tableStyles.muted, tableStyles.ellipsis]}>{entry.target.type}</span>
      </div>
    </div>
  )
}
