import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { DateRange } from "@/features/activity-log/lib/datemath"
import { dateRangeStyles } from "@/features/activity-log/components/date-range/date-range-styles"
import { describeAny } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

export function RecentRanges({
  recent,
  onChoose,
}: {
  recent: readonly DateRange[]
  onChoose: (range: DateRange) => void
}) {
  return (
    <section sx={dateRangeStyles.section}>
      <p sx={dateRangeStyles.sectionTitle}>{m.activity_recently_used()}</p>
      {recent.length === 0 ? (
        <p sx={styles.empty}>{m.activity_recently_used_empty()}</p>
      ) : (
        <div sx={dateRangeStyles.section}>
          {recent.map((range) => (
            <button
              key={`${range.from}-${range.to}`}
              onClick={() => {
                onChoose(range)
              }}
              sx={dateRangeStyles.link}
              type="button"
            >
              {describeAny(range)}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
