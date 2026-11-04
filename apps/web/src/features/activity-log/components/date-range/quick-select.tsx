import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
} from "@taiyomoe/ui/components/ui/number-field"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import type { DateMathUnit, DateRange } from "@/features/activity-log/lib/datemath"
import { dateRangeStyles } from "@/features/activity-log/components/date-range/date-range-styles"
import { unitName } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const QUICK_UNITS: readonly DateMathUnit[] = ["s", "m", "h", "d", "w", "M", "y"]
const styles = stylex.create({
  quickRow: {
    gap: "0.5rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 4.5rem minmax(0, 1.2fr) auto",
  },
  fit: {
    minWidth: 0,
    width: "100%",
  },
})

export function QuickSelect({
  direction,
  amount,
  unit,
  onDirectionChange,
  onAmountChange,
  onUnitChange,
  onChoose,
}: {
  direction: "last" | "next"
  amount: number
  unit: DateMathUnit
  onDirectionChange: (direction: "last" | "next") => void
  onAmountChange: (amount: number) => void
  onUnitChange: (unit: DateMathUnit) => void
  onChoose: (range: DateRange) => void
}) {
  return (
    <section sx={dateRangeStyles.section}>
      <p sx={dateRangeStyles.sectionTitle}>{m.activity_quick_select()}</p>
      <div sx={styles.quickRow}>
        <Select
          items={[
            { value: "last", label: m.activity_last() },
            { value: "next", label: m.activity_next() },
          ]}
          onValueChange={(value) => {
            if (value === "last" || value === "next") {
              onDirectionChange(value)
            }
          }}
          value={direction}
        >
          <SelectTrigger aria-label={m.activity_direction()} sx={styles.fit}>
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            <SelectItem value="last">{m.activity_last()}</SelectItem>
            <SelectItem value="next">{m.activity_next()}</SelectItem>
          </SelectPopup>
        </Select>
        <NumberField
          aria-label={m.activity_amount()}
          min={1}
          onValueChange={(value) => {
            onAmountChange(value === null ? 1 : Math.max(1, Math.round(value)))
          }}
          value={amount}
        >
          <NumberFieldGroup>
            <NumberFieldInput />
          </NumberFieldGroup>
        </NumberField>
        <Select
          items={QUICK_UNITS.map((value) => ({ value, label: unitName(value) }))}
          onValueChange={(value) => {
            const next = QUICK_UNITS.find((candidate) => candidate === value)

            if (next !== undefined) {
              onUnitChange(next)
            }
          }}
          value={unit}
        >
          <SelectTrigger aria-label={m.activity_unit()} sx={styles.fit}>
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {QUICK_UNITS.map((value) => (
              <SelectItem key={value} value={value}>
                {unitName(value)}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
        <Button
          onClick={() => {
            onChoose(
              direction === "last"
                ? { from: `now-${amount}${unit}`, to: "now" }
                : { from: "now", to: `now+${amount}${unit}` },
            )
          }}
          variant="secondary"
        >
          {m.activity_apply()}
        </Button>
      </div>
    </section>
  )
}
