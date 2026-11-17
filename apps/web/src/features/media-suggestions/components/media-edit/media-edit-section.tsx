import type { MediaEditField } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { Pill } from "@/components/badges/pill"
import { FieldEditor } from "@/features/media-suggestions/components/field-editors/field-editor"
import { mediaEditStyles } from "@/features/media-suggestions/components/media-edit/media-edit-styles"
import { FIELD_LABELS } from "@/features/media-suggestions/lib/media-edit-model"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  cardHeader: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
  },
  details: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))",
  },
})

export function MediaEditSection({
  title,
  fields,
  changed,
  draft,
  onChange,
}: {
  title: string
  fields: readonly MediaEditField[]
  changed: boolean
  draft: MediaEditDraft
  onChange: (draft: MediaEditDraft) => void
}) {
  return (
    <section sx={mediaEditStyles.card}>
      <div sx={styles.cardHeader}>
        <h2 sx={styles.cardTitle}>{title}</h2>
        {changed ? <Pill variant="info">{m.media_edit_changed()}</Pill> : null}
      </div>
      {fields.length === 1 ? (
        <FieldEditor draft={draft} field={fields[0] ?? "titles"} onChange={onChange} />
      ) : (
        <div sx={styles.details}>
          {fields.map((field) => (
            <Field key={field}>
              <FieldLabel>{FIELD_LABELS[field]()}</FieldLabel>
              <FieldEditor draft={draft} field={field} onChange={onChange} />
            </Field>
          ))}
        </div>
      )}
    </section>
  )
}
