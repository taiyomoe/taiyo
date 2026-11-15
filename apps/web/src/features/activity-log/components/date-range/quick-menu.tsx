import * as stylex from "@stylexjs/stylex"
import { Calendar as CalendarIcon, ChevronDown } from "@taiyomoe/ui/components/icons"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { RefreshInterval } from "@/features/activity-log/lib/activity-log"
import { AutoRefresh } from "@/features/activity-log/components/date-range/auto-refresh"
import { CommonRanges } from "@/features/activity-log/components/date-range/common-ranges"
import { dateRangeStyles } from "@/features/activity-log/components/date-range/date-range-styles"
import { QuickSelect } from "@/features/activity-log/components/date-range/quick-select"
import { RecentRanges } from "@/features/activity-log/components/date-range/recent-ranges"
import {
  type DateMathUnit,
  type DateRange,
  parseDateMath,
} from "@/features/activity-log/lib/datemath"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  quick: {
    paddingInline: "0.75rem",
    borderEndStartRadius: `calc(${radius.xl} - 1px)`,
    borderInlineEndColor: colors.border,
    borderInlineEndStyle: "solid",
    borderInlineEndWidth: 1,
    borderStartStartRadius: `calc(${radius.xl} - 1px)`,
    color: colors.mutedForeground,
  },
  menu: {
    padding: "0.5rem",
    gap: "1.125rem",
    display: "flex",
    flexDirection: "column",
    width: "min(28rem, calc(100vw - 2rem))",
  },
})

export function QuickMenu({
  from,
  to,
  recent,
  refresh,
  onApply,
  onRefreshChange,
}: {
  from: string
  to: string
  recent: readonly DateRange[]
  refresh: RefreshInterval | undefined
  onApply: (range: DateRange) => void
  onRefreshChange: (refresh: RefreshInterval | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const current = parseDateMath(from)
  const initial =
    current?.kind === "relative" && current.amount < 0 && to === "now"
      ? { amount: -current.amount, unit: current.unit }
      : { amount: 15, unit: "m" as const }
  const [direction, setDirection] = useState<"last" | "next">("last")
  const [amount, setAmount] = useState(initial.amount)
  const [unit, setUnit] = useState<DateMathUnit>(initial.unit)
  const [refreshValue, setRefreshValue] = useState<RefreshInterval>(refresh ?? "30s")
  const choose = (range: DateRange) => {
    setOpen(false)
    onApply(range)
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        aria-label={m.activity_quick_menu()}
        sx={[dateRangeStyles.segment, styles.quick]}
      >
        <CalendarIcon size={18} />
        <ChevronDown size={14} />
      </PopoverTrigger>
      <PopoverPopup align="start">
        <div sx={styles.menu}>
          <QuickSelect
            amount={amount}
            direction={direction}
            onAmountChange={setAmount}
            onChoose={choose}
            onDirectionChange={setDirection}
            onUnitChange={setUnit}
            unit={unit}
          />
          <CommonRanges from={from} onChoose={choose} to={to} />
          <RecentRanges onChoose={choose} recent={recent} />
          <AutoRefresh
            onRefreshChange={onRefreshChange}
            onRefreshValueChange={setRefreshValue}
            refresh={refresh}
            refreshValue={refreshValue}
          />
        </div>
      </PopoverPopup>
    </Popover>
  )
}
