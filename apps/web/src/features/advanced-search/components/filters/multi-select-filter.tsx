import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { useId } from "react"
import type { FilterOption } from "@/features/advanced-search/lib/filter-options"
import { FilterField } from "@/features/advanced-search/components/filters/filter-field"
import { FilterSummary } from "@/features/advanced-search/components/filters/filter-summary"
import { OptionLabel } from "@/features/advanced-search/components/filters/option-label"

const styles = stylex.create({
  trigger: {
    width: "100%",
  },
})

export function MultiSelectFilter<T extends string>({
  label,
  options,
  value,
  onValueChange,
  empty,
}: {
  label: string
  options: ReadonlyArray<FilterOption<T>>
  value: readonly T[]
  onValueChange: (value: T[]) => void
  empty?: ReactNode
}) {
  const labelId = useId()
  const optionOf = (item: T) => options.find((option) => option.value === item)

  return (
    <FilterField
      label={label}
      labelId={labelId}
      onClear={
        value.length === 0
          ? null
          : () => {
              onValueChange([])
            }
      }
    >
      <Select<T, true>
        items={options.map((option) => ({ value: option.value, label: option.label() }))}
        multiple
        onValueChange={(next) => {
          onValueChange(options.map((option) => option.value).filter((item) => next.includes(item)))
        }}
        value={[...value]}
      >
        <SelectTrigger aria-labelledby={labelId} sx={styles.trigger}>
          <SelectValue>
            {(selected: T[]) => {
              const single = selected.length === 1 ? selected[0] : undefined

              return (
                <FilterSummary
                  empty={empty}
                  icon={single === undefined ? undefined : optionOf(single)?.icon}
                  labels={selected.map((item) => optionOf(item)?.label() ?? item)}
                />
              )
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectPopup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <OptionLabel icon={option.icon}>{option.label()}</OptionLabel>
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </FilterField>
  )
}
