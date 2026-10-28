import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { m } from "@/paraglide/messages"

export function RejectNoteField({
  reason,
  touched,
  rows,
  onReasonChange,
  onBlur,
}: {
  reason: string
  touched: boolean
  rows: number
  onReasonChange: (reason: string) => void
  onBlur?: () => void
}) {
  return (
    <Field invalid={touched && reason.trim() === ""}>
      <FieldLabel>{m.review_reject_note()}</FieldLabel>
      <Textarea
        onBlur={onBlur}
        onChange={(event) => {
          onReasonChange(event.target.value)
        }}
        placeholder={m.review_chapter_reason_placeholder()}
        rows={rows}
        value={reason}
      />
      {touched && reason.trim() === "" ? (
        <FieldError match>{m.review_reject_note_required()}</FieldError>
      ) : null}
    </Field>
  )
}
