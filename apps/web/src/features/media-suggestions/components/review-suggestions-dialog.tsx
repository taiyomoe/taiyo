import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { useState } from "react"
import type { MediaSuggestion } from "@/features/media-suggestions/api/media-suggestions"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import {
  useAcceptSuggestions,
  useRejectSuggestions,
} from "@/features/media-suggestions/api/media-suggestions"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type SuggestionReview = {
  decision: "accept" | "reject"
  suggestions: MediaSuggestion[]
  /** Opened from the selection, which clears once the review succeeds. */
  bulk: boolean
}

/** Accepts every field of the suggestions as suggested, or rejects them, with one note. */
export function ReviewSuggestionsDialog({
  review,
  onClose,
  onBulkDone,
}: {
  review: SuggestionReview | null
  onClose: () => void
  onBulkDone: () => void
}) {
  const accept = useAcceptSuggestions()
  const reject = useRejectSuggestions()
  const [note, setNote] = useState("")
  const [noteRequired, setNoteRequired] = useState(false)
  const rejecting = review?.decision === "reject"
  const mutation = rejecting ? reject : accept
  const [only] = review?.suggestions ?? []
  const count = review?.suggestions.length ?? 0
  const name = only?.media.title ?? m.media_untitled()
  const close = () => {
    accept.reset()
    reject.reset()
    setNote("")
    setNoteRequired(false)
    onClose()
  }
  let title = m.suggestions_accept_title({ count })
  let description = m.suggestions_accept_description()

  if (rejecting) {
    description = m.suggestions_reject_description()
    title =
      count === 1
        ? m.suggestions_reject_title_one({ title: name })
        : m.suggestions_reject_title({ count })
  } else if (count === 1) {
    title = m.suggestions_accept_title_one({ title: name })

    if (only?.conflicts.length === 0) {
      description = m.suggestions_accept_description_one()
    }
  }

  return (
    <BulkEditDialog
      changed
      description={description}
      error={mutation.isError ? getErrorMessage(mutation.error) : null}
      onClose={close}
      onSubmit={() => {
        if (review === null) {
          return
        }

        if (rejecting && note.trim() === "") {
          setNoteRequired(true)

          return
        }

        mutation.mutate(
          {
            suggestionIds: review.suggestions.map((suggestion) => suggestion.id),
            note: note.trim(),
          },
          {
            onSuccess: (result) => {
              toastBulkResult(
                result,
                rejecting ? m.suggestions_bulk_rejected : m.suggestions_bulk_accepted,
              )

              if (review.bulk) {
                onBulkDone()
              }

              close()
            },
          },
        )
      }}
      open={review !== null}
      pending={mutation.isPending}
      submitLabel={rejecting ? m.suggestions_reject() : m.suggestions_accept()}
      submitVariant={rejecting ? "destructive" : "default"}
      title={title}
    >
      <Field invalid={noteRequired && note.trim() === ""}>
        <FieldLabel>{m.suggestion_review_note()}</FieldLabel>
        <Textarea
          maxLength={2000}
          onChange={(event) => {
            setNote(event.target.value)
          }}
          placeholder={
            rejecting
              ? m.suggestions_reject_note_placeholder()
              : m.suggestions_accept_note_placeholder()
          }
          rows={3}
          value={note}
        />
        {noteRequired && note.trim() === "" ? (
          <FieldError match>{m.review_reject_note_required()}</FieldError>
        ) : (
          <FieldDescription>
            {rejecting ? m.suggestions_note_shown() : m.suggestions_note_optional()}
          </FieldDescription>
        )}
      </Field>
    </BulkEditDialog>
  )
}
