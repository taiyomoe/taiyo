import type { Language } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { LanguageFlag } from "@/components/flags/flags"
import { getLanguageName } from "@/components/flags/language-flags"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
    width: "100%",
  },
  optionLabel: {
    overflow: "hidden",
    flexGrow: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
})

export function LanguagePicker<T extends Language>({
  languages,
  value,
  onChange,
}: {
  languages: readonly T[]
  value: Language | null
  onChange: (value: T) => void
}) {
  const options = languages
    .map((code) => ({ code, name: getLanguageName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name))
  const selected = options.find((option) => option.code === value) ?? null

  return (
    <Combobox<(typeof options)[number]>
      isItemEqualToValue={(a, b) => a.code === b.code}
      itemToStringLabel={(item) => item.name}
      items={options}
      onValueChange={(next) => {
        if (next !== null) {
          onChange(next.code)
        }
      }}
      value={selected}
    >
      <ComboboxInput
        placeholder={m.upload_language_placeholder()}
        startAddon={selected === null ? null : <LanguageFlag language={selected.code} />}
      />
      <ComboboxPopup>
        <ComboboxList>
          {(item: (typeof options)[number]) => (
            <ComboboxItem key={item.code} value={item}>
              <span sx={styles.option}>
                <LanguageFlag language={item.code} />
                <span sx={styles.optionLabel}>{item.name}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>{m.upload_language_empty()}</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  )
}
