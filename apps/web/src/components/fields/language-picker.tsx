import * as stylex from "@stylexjs/stylex"
import { LANGUAGES, type Language } from "@taiyomoe/db/constants"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { getLanguageName, LanguageFlag } from "@/components/flags/flags"
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
const LANGUAGE_OPTIONS = [...LANGUAGES]
  .map((code) => ({ code, name: getLanguageName(code) }))
  .sort((a, b) => a.name.localeCompare(b.name))

export function LanguagePicker({
  value,
  onChange,
}: {
  value: Language
  onChange: (value: Language) => void
}) {
  const selected = LANGUAGE_OPTIONS.find((option) => option.code === value) ?? null

  return (
    <Combobox<(typeof LANGUAGE_OPTIONS)[number]>
      isItemEqualToValue={(a, b) => a.code === b.code}
      itemToStringLabel={(item) => item.name}
      items={LANGUAGE_OPTIONS}
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
          {(item: (typeof LANGUAGE_OPTIONS)[number]) => (
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
