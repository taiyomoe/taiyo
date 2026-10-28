// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldError } from "@taiyomoe/ui/components/ui/field"
import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import { fieldEditorStyles } from "@/features/media-suggestions/components/field-editors/field-editor-styles"
import { TitleRow } from "@/features/media-suggestions/components/field-editors/title-row"
import { useRowKeys } from "@/features/media-suggestions/hooks/use-row-keys"
import {
  type MediaEditTitle,
  getTitlesError,
} from "@/features/media-suggestions/lib/media-edit-model"
import { move } from "@/features/media-suggestions/lib/move"
import { m } from "@/paraglide/messages"

export function TitlesEditor({ draft, onChange: change }: EditorProps) {
  const value = draft.titles
  const onChange = (next: MediaEditTitle[]) => {
    change({ ...draft, titles: next })
  }
  const rows = useRowKeys(value.length)
  const error = getTitlesError(value)

  return (
    <div sx={fieldEditorStyles.stack}>
      {value.map((title, index) => (
        <TitleRow
          first={index === 0}
          key={rows.keys[index]}
          last={index === value.length - 1}
          onMakeMain={() => {
            onChange(value.map((item, i) => ({ ...item, isMainTitle: i === index })))
          }}
          onMove={(offset) => {
            rows.move(index, offset)
            onChange(move(value, index, offset))
          }}
          onRemove={() => {
            rows.remove(index)
            onChange(value.filter((_, i) => i !== index))
          }}
          onUpdate={(patch) => {
            onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))
          }}
          title={title}
        />
      ))}
      {error === null ? null : (
        <Field invalid>
          <FieldError match>{error}</FieldError>
        </Field>
      )}
      <div sx={fieldEditorStyles.addRow}>
        <Button
          onClick={() => {
            rows.add()
            onChange([
              ...value,
              { title: "", language: "en", isAcronym: false, isMainTitle: value.length === 0 },
            ])
          }}
          size="sm"
          variant="outline"
        >
          <Plus />
          {m.media_edit_title_add()}
        </Button>
      </div>
    </div>
  )
}
