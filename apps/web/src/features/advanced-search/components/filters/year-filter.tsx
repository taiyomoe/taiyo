import type { NumberFieldPrimitive } from "@taiyomoe/ui/components/ui/number-field"
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@taiyomoe/ui/components/ui/number-field"
import { useId, useRef, useState } from "react"
import { FilterField } from "@/features/advanced-search/components/filters/filter-field"
import { MAX_YEAR, MIN_YEAR } from "@/features/advanced-search/lib/advanced-search"
import { m } from "@/paraglide/messages"

const STEP_REASONS = new Set<NumberFieldPrimitive.Root.ChangeEventReason>([
  "increment-press",
  "decrement-press",
  "keyboard",
  "wheel",
])

export function YearFilter({
  value,
  onValueChange,
}: {
  value: number | null
  onValueChange: (value: number | null) => void
}) {
  const labelId = useId()
  const [draft, setDraft] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)
  const draftRef = useRef(value)

  if (value !== syncedValue) {
    setSyncedValue(value)
    setDraft(value)
  }

  return (
    <FilterField
      label={m.search_filter_year()}
      labelId={labelId}
      onClear={
        value === null
          ? null
          : () => {
              onValueChange(null)
            }
      }
    >
      <NumberField
        format={{ useGrouping: false }}
        max={MAX_YEAR}
        min={MIN_YEAR}
        onValueChange={(next, details) => {
          const startsFromEmpty = draft === null && STEP_REASONS.has(details.reason)

          draftRef.current = startsFromEmpty ? new Date().getFullYear() : next
          setDraft(draftRef.current)
        }}
        onValueCommitted={() => {
          const next = draftRef.current

          if (next !== value) {
            onValueChange(next === null || next < MIN_YEAR || next > MAX_YEAR ? null : next)
          }
        }}
        value={draft}
      >
        <NumberFieldGroup>
          <NumberFieldDecrement aria-label={m.search_year_previous()} />
          <NumberFieldInput aria-labelledby={labelId} placeholder={m.search_filter_any()} />
          <NumberFieldIncrement aria-label={m.search_year_next()} />
        </NumberFieldGroup>
      </NumberField>
    </FilterField>
  )
}
