import * as stylex from "@stylexjs/stylex"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { RELEASE_UNITS, type ReleaseUnit } from "@/features/uploads/lib/chapter-batch/release"
import { m } from "@/paraglide/messages"

const UNIT_LABELS: Record<ReleaseUnit, () => string> = {
  hours: m.upload_unit_hours,
  days: m.upload_unit_days,
}
const styles = stylex.create({
  amount: {
    gap: "0.5rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "5rem minmax(0, 1fr)",
  },
})

export function AmountInput({
  amount,
  unit,
  invalid,
  onChange,
}: {
  amount: string
  unit: ReleaseUnit
  invalid: boolean
  onChange: (patch: { amount?: string; unit?: ReleaseUnit }) => void
}) {
  return (
    <div sx={styles.amount}>
      <Input
        aria-invalid={invalid || undefined}
        aria-label={m.upload_release_amount()}
        inputMode="decimal"
        onChange={(event) => {
          onChange({ amount: event.target.value })
        }}
        value={amount}
      />
      <Select
        onValueChange={(next: ReleaseUnit | null) => {
          if (next !== null) {
            onChange({ unit: next })
          }
        }}
        value={unit}
      >
        <SelectTrigger aria-label={m.upload_release_unit()}>
          <SelectValue>{() => UNIT_LABELS[unit]()}</SelectValue>
        </SelectTrigger>
        <SelectPopup>
          {RELEASE_UNITS.map((value) => (
            <SelectItem key={value} value={value}>
              {UNIT_LABELS[value]()}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  )
}
