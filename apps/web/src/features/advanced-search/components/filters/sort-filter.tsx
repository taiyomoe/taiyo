import * as stylex from "@stylexjs/stylex"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { useId } from "react"
import type { SearchSort } from "@/features/advanced-search/lib/advanced-search"
import { FilterField } from "@/features/advanced-search/components/filters/filter-field"
import { OptionLabel } from "@/features/advanced-search/components/filters/option-label"
import { SORT_OPTIONS } from "@/features/advanced-search/lib/filter-options"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  trigger: {
    width: "100%",
  },
})

export function SortFilter({
  value,
  onValueChange,
}: {
  value: SearchSort
  onValueChange: (value: SearchSort) => void
}) {
  const labelId = useId()

  return (
    <FilterField label={m.search_filter_sort()} labelId={labelId}>
      <Select<SearchSort>
        items={SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label() }))}
        onValueChange={(next) => {
          if (next !== null) {
            onValueChange(next)
          }
        }}
        value={value}
      >
        <SelectTrigger aria-labelledby={labelId} sx={styles.trigger}>
          <SelectValue>
            {(selected: SearchSort) => {
              const option = SORT_OPTIONS.find((candidate) => candidate.value === selected)

              return <OptionLabel icon={option?.icon}>{option?.label()}</OptionLabel>
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectPopup>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <OptionLabel icon={option.icon}>{option.label()}</OptionLabel>
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </FilterField>
  )
}
