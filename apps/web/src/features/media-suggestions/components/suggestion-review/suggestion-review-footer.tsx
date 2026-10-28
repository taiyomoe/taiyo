import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  footer: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    backdropFilter: "blur(12px)",
    backgroundColor: `color-mix(in srgb, ${colors.card} 92%, transparent)`,
    boxShadow: shadows.overlay,
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    zIndex: 10,
    bottom: "1rem",
  },
  footerActions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  footerText: {
    color: colors.mutedForeground,
    flexGrow: 1,
    fontSize: "0.875rem",
  },
})

export function SuggestionReviewFooter({
  failure,
  note,
  onNoteChange,
  noteRequired,
  error,
  acceptedCount,
  total,
  pending,
  onReject,
  onAccept,
}: {
  failure: string | null
  note: string
  onNoteChange: (note: string) => void
  noteRequired: boolean
  error: string | null
  acceptedCount: number
  total: number
  pending: boolean
  onReject: () => void
  onAccept: () => void
}) {
  return (
    <div sx={styles.footer}>
      <ErrorAlert message={failure} />
      <Field invalid={noteRequired && note.trim() === ""}>
        <FieldLabel>{m.suggestion_review_note()}</FieldLabel>
        <Textarea
          maxLength={2000}
          onChange={(event) => {
            onNoteChange(event.target.value)
          }}
          placeholder={m.suggestion_review_note_placeholder()}
          rows={2}
          value={note}
        />
        {noteRequired && note.trim() === "" ? (
          <FieldError match>{m.review_reject_note_required()}</FieldError>
        ) : null}
      </Field>
      <div sx={styles.footerActions}>
        <span sx={styles.footerText}>
          {error ?? m.suggestion_accepting({ count: acceptedCount, total })}
        </span>
        <Button disabled={pending} onClick={onReject} variant="outline">
          {m.suggestion_reject_all()}
        </Button>
        <Button disabled={pending || acceptedCount === 0 || error !== null} onClick={onAccept}>
          {m.suggestion_accept()}
        </Button>
      </div>
    </div>
  )
}
