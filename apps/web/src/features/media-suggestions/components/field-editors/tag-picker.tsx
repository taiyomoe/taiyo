// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { useState } from "react"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { fieldEditorStyles } from "@/features/media-suggestions/components/field-editors/field-editor-styles"
import { TAG_OPTIONS } from "@/features/media-suggestions/lib/media-edit-labels"
import { m } from "@/paraglide/messages"

export function TagPicker({
  selected,
  onPick,
}: {
  selected: MediaEditDraft["tags"]
  onPick: (key: string) => void
}) {
  const [input, setInput] = useState("")

  return (
    <div sx={fieldEditorStyles.addPicker}>
      <Combobox<(typeof TAG_OPTIONS)[number]>
        inputValue={input}
        isItemEqualToValue={(a, b) => a.key === b.key}
        itemToStringLabel={(item) => item.name}
        items={TAG_OPTIONS.filter((option) => !selected.some((tag) => tag.key === option.key))}
        onInputValueChange={setInput}
        onValueChange={(next) => {
          if (next !== null) {
            onPick(next.key)
            setInput("")
          }
        }}
        value={null}
      >
        <ComboboxInput placeholder={m.media_edit_tags_add()} size="sm" />
        <ComboboxPopup>
          <ComboboxList>
            {(item: (typeof TAG_OPTIONS)[number]) => (
              <ComboboxItem key={item.key} value={item}>
                <span sx={fieldEditorStyles.option}>
                  {item.name}
                  <span sx={fieldEditorStyles.muted}>{item.category}</span>
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>{m.media_edit_tags_none()}</ComboboxEmpty>
        </ComboboxPopup>
      </Combobox>
    </div>
  )
}
