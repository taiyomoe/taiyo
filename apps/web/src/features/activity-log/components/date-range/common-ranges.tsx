import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { dateRangeStyles } from "@/features/activity-log/components/date-range/date-range-styles"
import { type DateRange, sameRange } from "@/features/activity-log/lib/datemath"
import { COMMON_RANGES, describeAny } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  common: {
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    rowGap: "0.125rem",
  },
  linkActive: {
    color: colors.primary,
    fontWeight: 600,
  },
})

export function CommonRanges({
  from,
  to,
  onChoose,
}: {
  from: string
  to: string
  onChoose: (range: DateRange) => void
}) {
  return (
    <section sx={dateRangeStyles.section}>
      <p sx={dateRangeStyles.sectionTitle}>{m.activity_commonly_used()}</p>
      <div sx={styles.common}>
        {COMMON_RANGES.map((range) => (
          <button
            key={`${range.from}-${range.to}`}
            onClick={() => {
              onChoose(range)
            }}
            sx={[dateRangeStyles.link, sameRange(range, { from, to }) && styles.linkActive]}
            type="button"
          >
            {describeAny(range)}
          </button>
        ))}
      </div>
    </section>
  )
}
