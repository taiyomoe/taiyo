import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxStatus,
  ComboboxTrigger,
} from "@taiyomoe/ui/components/ui/combobox"
import { SelectButton } from "@taiyomoe/ui/components/ui/select"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId, useRef } from "react"
import { FilterField } from "@/features/advanced-search/components/filters/filter-field"

const styles = stylex.create({
  trigger: {
    width: "100%",
  },
  popup: {
    minWidth: "17rem",
  },
  search: {
    padding: "0.375rem",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
})

export function ComboFilter<T>({
  label,
  items,
  value,
  onValueChange,
  getKey,
  getLabel,
  renderItem,
  summary,
  searchPlaceholder,
  empty,
  status,
  inputValue,
  onInputValueChange,
  async = false,
  disabled = false,
}: {
  label: ReactNode
  items: readonly T[]
  value: T[]
  onValueChange: (value: T[]) => void
  getKey: (item: T) => string
  getLabel: (item: T) => string
  renderItem: (item: T) => ReactNode
  summary: ReactNode
  searchPlaceholder: string
  empty: ReactNode
  status?: ReactNode
  inputValue?: string
  onInputValueChange?: (value: string) => void
  async?: boolean
  disabled?: boolean
}) {
  const labelId = useId()
  const anchorRef = useRef<HTMLDivElement>(null)

  return (
    <FilterField
      label={label}
      labelId={labelId}
      onClear={
        value.length === 0 || disabled
          ? null
          : () => {
              onValueChange([])
            }
      }
    >
      <Combobox<T, true>
        disabled={disabled}
        filter={async ? null : undefined}
        inputValue={inputValue}
        isItemEqualToValue={(a, b) => getKey(a) === getKey(b)}
        items={items}
        itemToStringLabel={getLabel}
        itemToStringValue={getKey}
        multiple
        onInputValueChange={onInputValueChange}
        onValueChange={onValueChange}
        value={value}
      >
        <div ref={anchorRef}>
          <ComboboxTrigger
            aria-labelledby={labelId}
            render={<SelectButton disabled={disabled} sx={styles.trigger} />}
          >
            {summary}
          </ComboboxTrigger>
        </div>
        <ComboboxPopup anchor={anchorRef} sx={styles.popup}>
          <div sx={styles.search}>
            <ComboboxInput
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              showTrigger={false}
              startAddon={<Search size={14} />}
            />
          </div>
          {status === undefined ? null : <ComboboxStatus>{status}</ComboboxStatus>}
          <ComboboxEmpty>{empty}</ComboboxEmpty>
          <ComboboxList>
            {(item: T) => (
              <ComboboxItem key={getKey(item)} value={item}>
                {renderItem(item)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </FilterField>
  )
}
