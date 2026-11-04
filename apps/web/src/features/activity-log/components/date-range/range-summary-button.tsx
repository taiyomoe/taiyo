import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { dateRangeStyles } from "@/features/activity-log/components/date-range/date-range-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  rangeSegment: {
    flex: "1",
    justifyContent: "flex-start",
  },
  rangeText: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    flexGrow: 1,
    minWidth: 0,
  },
  showDates: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    marginInlineStart: "auto",
  },
})

export function RangeSummaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      sx={[dateRangeStyles.segment, styles.rangeSegment, dateRangeStyles.last]}
      type="button"
    >
      <span sx={styles.rangeText}>
        {label}
        <span sx={styles.showDates}>{m.activity_show_dates()}</span>
      </span>
    </button>
  )
}
