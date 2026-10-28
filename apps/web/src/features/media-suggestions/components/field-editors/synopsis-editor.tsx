// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { LANGUAGES, type Language } from "@taiyomoe/db/constants"
import { useState } from "react"
import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { fieldEditorStyles } from "@/features/media-suggestions/components/field-editors/field-editor-styles"
import { SynopsisEntry } from "@/features/media-suggestions/components/field-editors/synopsis-entry"
import { SynopsisLanguagePicker } from "@/features/media-suggestions/components/field-editors/synopsis-language-picker"
import { m } from "@/paraglide/messages"

export function SynopsisEditor({ draft, onChange: change }: EditorProps) {
  const value = draft.synopsis
  const onChange = (next: MediaEditDraft["synopsis"]) => {
    change({ ...draft, synopsis: next })
  }
  const [extra, setExtra] = useState<Language[]>([])
  const languages = [
    ...Object.keys(value).filter((key): key is Language =>
      (LANGUAGES as readonly string[]).includes(key),
    ),
    ...extra.filter((language) => !(language in value)),
  ]

  return (
    <div sx={fieldEditorStyles.stack}>
      {languages.length === 0 ? (
        <p sx={fieldEditorStyles.muted}>{m.media_info_no_synopsis()}</p>
      ) : null}
      {languages.map((language) => (
        <SynopsisEntry
          key={language}
          language={language}
          onChange={(text) => {
            onChange({ ...value, [language]: text })
          }}
          onRemove={() => {
            const { [language]: _removed, ...rest } = value

            setExtra(extra.filter((item) => item !== language))
            onChange(rest)
          }}
          value={value[language] ?? ""}
        />
      ))}
      <div sx={fieldEditorStyles.addRow}>
        <SynopsisLanguagePicker
          exclude={languages}
          onPick={(language) => {
            setExtra([...extra, language])
          }}
        />
      </div>
    </div>
  )
}
