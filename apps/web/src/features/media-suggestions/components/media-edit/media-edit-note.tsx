// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { mediaEditStyles } from "@/features/media-suggestions/components/media-edit/media-edit-styles"
import { m } from "@/paraglide/messages"

export function MediaEditNote({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <section sx={mediaEditStyles.card}>
      <Field>
        <FieldLabel>{m.media_edit_note()}</FieldLabel>
        <Textarea
          maxLength={2000}
          onChange={(event) => {
            onChange(event.target.value)
          }}
          placeholder={m.media_edit_note_placeholder()}
          rows={3}
          value={value}
        />
        <FieldDescription>{m.media_edit_note_description()}</FieldDescription>
      </Field>
    </section>
  )
}
