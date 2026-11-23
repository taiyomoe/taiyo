import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Globe } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId, useState } from "react"
import type { Review } from "@/features/reviews/api/reviews"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { UnsavedChangesGuard } from "@/components/dialogs/unsaved-changes-guard"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { useSaveReview } from "@/features/reviews/api/reviews"
import {
  clearReviewDraft,
  loadReviewDraft,
  measureReviewBody,
  type ReviewDraft,
  saveReviewDraft,
} from "@/features/reviews/lib/review-body"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const { maxBodyLength } = config.reviews
const styles = stylex.create({
  form: {
    padding: "1rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
  },
  label: {
    color: colors.foreground,
    fontSize: "0.9375rem",
    fontWeight: 650,
  },
  restored: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  textarea: {
    lineHeight: 1.6,
  },
  row: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  spoilers: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
  },
  counter: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
  over: {
    color: colors.destructive,
  },
  public: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "flex-start",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    lineHeight: 1.45,
  },
  publicIcon: {
    flexShrink: 0,
    height: "1lh",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    justifyContent: "flex-end",
  },
})
const describeLength = ({ missing, excess, length }: ReturnType<typeof measureReviewBody>) => {
  if (missing > 0) {
    return m.reviews_counter_missing({ count: missing })
  }

  return excess > 0
    ? m.reviews_counter_excess({ count: excess })
    : m.reviews_counter({ count: length, max: maxBodyLength })
}

/** Writes or edits the viewer's review, keeping a draft in this browser until it is saved. */
export function ReviewComposer({
  mediaId,
  userId,
  review,
  onDone,
}: {
  mediaId: string
  userId: string
  review: Review | null
  onDone: () => void
}) {
  const textareaId = useId()
  const counterId = useId()
  const save = useSaveReview(mediaId)
  const saved: ReviewDraft = {
    body: review?.body ?? "",
    containsSpoilers: review?.containsSpoilers ?? false,
  }
  const [initial] = useState(() => {
    const draft = loadReviewDraft(userId, mediaId)

    return draft === null ||
      (draft.body === saved.body && draft.containsSpoilers === saved.containsSpoilers)
      ? { draft: saved, restored: false }
      : { draft, restored: true }
  })
  const [draft, setDraft] = useState(initial.draft)
  const [restored, setRestored] = useState(initial.restored)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const measure = measureReviewBody(draft.body)
  const dirty =
    measure.normalized !== saved.body || draft.containsSpoilers !== saved.containsSpoilers
  const update = (next: ReviewDraft) => {
    setDraft(next)

    if (next.body === saved.body && next.containsSpoilers === saved.containsSpoilers) {
      clearReviewDraft(userId, mediaId)
    } else {
      saveReviewDraft(userId, mediaId, next)
    }
  }
  const discard = () => {
    clearReviewDraft(userId, mediaId)
    onDone()
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()

        if (!measure.valid || !dirty || save.isPending) {
          return
        }

        save.mutate(draft, {
          onSuccess: () => {
            clearReviewDraft(userId, mediaId)
            toastManager.add({
              title: review === null ? m.reviews_published() : m.reviews_updated(),
              type: "success",
            })
            onDone()
          },
        })
      }}
      sx={styles.form}
    >
      <label htmlFor={textareaId} sx={styles.label}>
        {review === null ? m.reviews_composer_title() : m.reviews_composer_edit_title()}
      </label>
      {restored ? (
        <p sx={styles.restored}>
          {m.reviews_draft_restored()}
          <Button
            onClick={() => {
              update(saved)
              setRestored(false)
            }}
            size="xs"
            variant="ghost"
          >
            {m.reviews_draft_discard()}
          </Button>
        </p>
      ) : null}
      <Textarea
        aria-describedby={counterId}
        aria-invalid={measure.excess > 0 ? true : undefined}
        id={textareaId}
        onChange={(event) => {
          update({ ...draft, body: event.target.value })
        }}
        placeholder={m.reviews_composer_placeholder()}
        rows={8}
        sx={styles.textarea}
        value={draft.body}
      />
      <div sx={styles.row}>
        <label sx={styles.spoilers}>
          <Checkbox
            checked={draft.containsSpoilers}
            onCheckedChange={(checked) => {
              update({ ...draft, containsSpoilers: checked })
            }}
          />
          {m.reviews_contains_spoilers()}
        </label>
        <span id={counterId} sx={[styles.counter, measure.excess > 0 && styles.over]}>
          {describeLength(measure)}
        </span>
      </div>
      <p sx={styles.public}>
        <Globe aria-hidden size={14} {...stylex.props(styles.publicIcon)} />
        {m.reviews_public_notice()}
      </p>
      <ErrorAlert message={save.isError ? getErrorMessage(save.error) : null} />
      <div sx={styles.actions}>
        <Button
          onClick={() => {
            if (dirty) {
              setConfirmation({
                title: m.unsaved_changes_title(),
                description: m.reviews_discard_description(),
                confirmLabel: m.unsaved_changes_discard(),
                destructive: true,
                run: () => {
                  discard()

                  return Promise.resolve()
                },
              })
            } else {
              discard()
            }
          }}
          variant="outline"
        >
          {m.cancel()}
        </Button>
        <Button disabled={!measure.valid || !dirty} loading={save.isPending} type="submit">
          {review === null ? m.reviews_publish() : m.reviews_save()}
        </Button>
      </div>
      <ConfirmDialog
        confirmation={confirmation}
        error={null}
        onClose={() => {
          setConfirmation(null)
        }}
        pending={false}
      />
      <UnsavedChangesGuard allowSamePage dirty={dirty && !save.isSuccess} />
    </form>
  )
}
