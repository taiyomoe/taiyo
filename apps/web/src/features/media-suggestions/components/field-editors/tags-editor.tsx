import * as stylex from "@stylexjs/stylex"
import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { fieldEditorStyles } from "@/features/media-suggestions/components/field-editors/field-editor-styles"
import { TagChip } from "@/features/media-suggestions/components/field-editors/tag-chip"
import { TagPicker } from "@/features/media-suggestions/components/field-editors/tag-picker"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  chips: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
  },
})

export function TagsEditor({ draft, onChange: change }: EditorProps) {
  const value = draft.tags
  const onChange = (next: MediaEditDraft["tags"]) => {
    change({ ...draft, tags: next })
  }

  return (
    <div sx={fieldEditorStyles.stack}>
      {value.length === 0 ? (
        <p sx={fieldEditorStyles.muted}>{m.media_edit_tags_empty()}</p>
      ) : (
        <ul sx={styles.chips}>
          {value.map((tag) => (
            <TagChip
              key={tag.key}
              onRemove={() => {
                onChange(value.filter((item) => item.key !== tag.key))
              }}
              onSpoilerChange={(isSpoiler) => {
                onChange(
                  value.map((item) => (item.key === tag.key ? { ...item, isSpoiler } : item)),
                )
              }}
              tag={tag}
            />
          ))}
        </ul>
      )}
      <TagPicker
        onPick={(key) => {
          onChange([...value, { key, isSpoiler: false }])
        }}
        selected={value}
      />
    </div>
  )
}
