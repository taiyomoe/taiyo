// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
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
import { fieldEditorStyles } from "@/features/media-suggestions/components/field-editors/field-editor-styles"
import { m } from "@/paraglide/messages"

const LANGUAGE_OPTIONS = [...LANGUAGES]
  .map((code) => ({ code, name: getLanguageName(code) }))
  .sort((a, b) => a.name.localeCompare(b.name))

type SynopsisLanguagePickerProps = {
  exclude: readonly Language[]
  onPick: (language: Language) => void
}

export function SynopsisLanguagePicker({ exclude, onPick }: SynopsisLanguagePickerProps) {
  return (
    <div sx={fieldEditorStyles.addPicker}>
      <Combobox<(typeof LANGUAGE_OPTIONS)[number]>
        isItemEqualToValue={(a, b) => a.code === b.code}
        itemToStringLabel={(item) => item.name}
        items={LANGUAGE_OPTIONS.filter((option) => !exclude.includes(option.code))}
        onValueChange={(next) => {
          if (next !== null) {
            onPick(next.code)
          }
        }}
        value={null}
      >
        <ComboboxInput placeholder={m.media_edit_synopsis_add()} size="sm" />
        <ComboboxPopup>
          <ComboboxList>
            {(item: (typeof LANGUAGE_OPTIONS)[number]) => (
              <ComboboxItem key={item.code} value={item}>
                <span sx={fieldEditorStyles.option}>
                  <LanguageFlag language={item.code} />
                  {item.name}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>{m.upload_language_empty()}</ComboboxEmpty>
        </ComboboxPopup>
      </Combobox>
    </div>
  )
}
