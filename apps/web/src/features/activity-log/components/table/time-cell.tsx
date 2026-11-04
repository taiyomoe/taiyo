import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { LogGroup } from "@/features/activity-log/lib/activity-log"
import { tableStyles } from "@/features/activity-log/components/table/table-styles"
import { formatTimestamp } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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
})

export function TimeCell({ group }: { group: LogGroup }) {
  const { day, time, milliseconds } = formatTimestamp(group.last)

  return (
    <time dateTime={group.last} sx={styles.time}>
      <span sx={styles.timeMain}>
        {time}
        <span sx={styles.timeMs}>.{milliseconds}</span>
      </span>
      <span sx={tableStyles.muted}>
        {group.count > 1 ? m.activity_group_from({ time: formatTimestamp(group.first).time }) : day}
      </span>
    </time>
  )
}
