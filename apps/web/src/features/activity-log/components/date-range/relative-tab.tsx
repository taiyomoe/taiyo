import * as stylex from "@stylexjs/stylex"
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@taiyomoe/ui/components/ui/number-field"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { dateRangeStyles } from "@/features/activity-log/components/date-range/date-range-styles"
import {
  DATE_MATH_UNITS,
  type DateMath,
  type DateMathUnit,
  toDateMath,
} from "@/features/activity-log/lib/datemath"
import { formatDateTime, unitName, unitSingular } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const RELATIVE_OPTIONS = DATE_MATH_UNITS.flatMap((unit) => [
  { value: `${unit}-`, unit, sign: -1 },
  { value: `${unit}+`, unit, sign: 1 },
])
const relativeLabel = (unit: DateMathUnit, sign: number) =>
  sign < 0
    ? m.activity_unit_ago({ unit: unitName(unit) })
    : m.activity_unit_from_now({ unit: unitName(unit) })
const styles = stylex.create({
  relativeRow: {
    gap: "0.5rem",
    display: "grid",
    gridTemplateColumns: "8.75rem minmax(0, 1fr)",
  },
  toggle: {
    gap: "0.625rem",
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
  },
  preview: {
    borderRadius: radius.lg,
    paddingBlock: "0.625rem",
    paddingInline: "0.75rem",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
  },
})

export function RelativeTab({
  parsed,
  resolved,
  onApply,
}: {
  parsed: DateMath | null
  resolved: Date
  onApply: (value: string) => void
}) {
  const relative =
    parsed?.kind === "relative"
      ? parsed
      : { kind: "relative" as const, amount: -15, unit: "m" as const, round: null }

  return (
    <div sx={dateRangeStyles.panel}>
      <div sx={styles.relativeRow}>
        <NumberField
          aria-label={m.activity_amount()}
          min={0}
          onValueChange={(next) => {
            const amount = Math.max(0, Math.round(next ?? 0))

            onApply(
              toDateMath({
                amount: amount * (relative.amount > 0 ? 1 : -1),
                unit: relative.unit,
                round: relative.round,
              }),
            )
          }}
          value={Math.abs(relative.amount)}
        >
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
        <Select
          items={RELATIVE_OPTIONS.map((option) => ({
            value: option.value,
            label: relativeLabel(option.unit, option.sign),
          }))}
          onValueChange={(next) => {
            const option = RELATIVE_OPTIONS.find((candidate) => candidate.value === next)

            if (option !== undefined) {
              onApply(
                toDateMath({
                  amount: Math.abs(relative.amount) * option.sign,
                  unit: option.unit,
                  round: relative.round === null ? null : option.unit,
                }),
              )
            }
          }}
          value={`${relative.unit}${relative.amount > 0 ? "+" : "-"}`}
        >
          <SelectTrigger aria-label={m.activity_unit()}>
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {RELATIVE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {relativeLabel(option.unit, option.sign)}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>
      <label sx={styles.toggle}>
        <Switch
          checked={relative.round !== null}
          onCheckedChange={(checked) => {
            onApply(
              toDateMath({
                amount: relative.amount,
                unit: relative.unit,
                round: checked ? relative.unit : null,
              }),
            )
          }}
        />
        {m.activity_round_to({ unit: unitSingular(relative.unit) })}
      </label>
      <div sx={styles.preview}>{formatDateTime(resolved)}</div>
    </div>
  )
}
