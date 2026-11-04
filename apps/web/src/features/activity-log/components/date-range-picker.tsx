import * as stylex from "@stylexjs/stylex"
import { ArrowRight } from "@taiyomoe/ui/components/icons"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { RefreshInterval } from "@/features/activity-log/lib/activity-log"
import type { DateRange } from "@/features/activity-log/lib/datemath"
import { DatePopover } from "@/features/activity-log/components/date-range/date-popover"
import { QuickMenu } from "@/features/activity-log/components/date-range/quick-menu"
import { RangeSummaryButton } from "@/features/activity-log/components/date-range/range-summary-button"
import { RefreshButton } from "@/features/activity-log/components/date-range/refresh-button"
import { rememberRange, useRecentRanges } from "@/features/activity-log/hooks/use-recent-ranges"
import { describeRange } from "@/features/activity-log/lib/format"

const styles = stylex.create({
  root: {
    gap: "0.5rem",
    alignItems: "stretch",
    display: "flex",
  },
  group: {
    borderColor: colors.input,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "stretch",
    backgroundClip: "padding-box",
    backgroundColor: colors.field,
    boxShadow: shadows.chip,
    display: "flex",
    flexBasis: "16rem",
    flexGrow: "1",
    flexShrink: "1",
    position: "relative",
    minHeight: "2.75rem",
    minWidth: 0,
  },
  arrow: {
    marginInline: "0.125rem",
    alignSelf: "center",
    color: colors.mutedForeground,
    flexShrink: 0,
  },
})

export function DateRangePicker({
  from,
  to,
  refresh,
  fetching,
  onChange,
  onRefreshChange,
  onRefresh,
}: {
  from: string
  to: string
  refresh: RefreshInterval | undefined
  fetching: boolean
  onChange: (range: DateRange) => void
  onRefreshChange: (refresh: RefreshInterval | undefined) => void
  onRefresh: () => void
}) {
  const [showDates, setShowDates] = useState(false)
  const recent = useRecentRanges()
  const pretty = describeRange(from, to)
  const apply = (range: DateRange) => {
    rememberRange(range)
    onChange(range)
  }

  return (
    <div sx={styles.root}>
      <div sx={styles.group}>
        <QuickMenu
          from={from}
          onApply={(range) => {
            setShowDates(false)
            apply(range)
          }}
          onRefreshChange={onRefreshChange}
          recent={recent}
          refresh={refresh}
          to={to}
        />
        {pretty !== null && !showDates ? (
          <RangeSummaryButton
            label={pretty}
            onClick={() => {
              setShowDates(true)
            }}
          />
        ) : (
          <>
            <DatePopover
              edge="start"
              onApply={(value) => {
                apply({ from: value, to })
              }}
              value={from}
            />
            <ArrowRight {...stylex.props(styles.arrow)} size={16} />
            <DatePopover
              edge="end"
              onApply={(value) => {
                apply({ from, to: value })
              }}
              value={to}
            />
          </>
        )}
      </div>
      <RefreshButton fetching={fetching} onRefresh={onRefresh} />
    </div>
  )
}
