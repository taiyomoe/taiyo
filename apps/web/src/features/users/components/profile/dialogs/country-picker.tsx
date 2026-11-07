import * as stylex from "@stylexjs/stylex"
import { COUNTRIES, type Country } from "@taiyomoe/db/constants"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { useMemo } from "react"
import { LazyCountryFlag } from "@/components/flags/lazy-country-flag"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
    width: "100%",
  },
  label: {
    overflow: "hidden",
    flexGrow: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
})

type Option = { code: Country; name: string }

export function CountryPicker({
  value,
  onChange,
}: {
  value: Country | null
  onChange: (value: Country | null) => void
}) {
  const options = useMemo(() => {
    const names = new Intl.DisplayNames([getLocale()], { type: "region" })

    return COUNTRIES.flatMap((code) => {
      try {
        const name = names.of(code.toUpperCase())

        return name === undefined || name === code.toUpperCase() ? [] : [{ code, name }]
      } catch {
        return []
      }
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [])
  const selected = options.find((option) => option.code === value) ?? null

  return (
    <Combobox<Option>
      isItemEqualToValue={(a, b) => a.code === b.code}
      itemToStringLabel={(item) => item.name}
      items={options}
      onValueChange={(next) => {
        onChange(next?.code ?? null)
      }}
      value={selected}
    >
      <ComboboxInput
        placeholder={m.profile_edit_not_set()}
        showClear
        startAddon={selected === null ? null : <LazyCountryFlag country={selected.code} />}
      />
      <ComboboxPopup>
        <ComboboxList>
          {(item: Option) => (
            <ComboboxItem key={item.code} value={item}>
              <span sx={styles.option}>
                <span sx={styles.label}>{item.name}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>{m.profile_follow_list_empty()}</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  )
}
