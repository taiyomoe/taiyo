import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { useState } from "react"
import type { ChapterSubmission } from "@/features/uploads/api/submissions"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { useRejectChapters } from "@/features/uploads/api/submissions"
import { RejectNoteField } from "@/features/uploads/components/chapter-reviews/reject-note-field"
import { submissionLabel } from "@/features/uploads/components/submission-cells"
import { toastReviewResult } from "@/features/uploads/lib/review-toast"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  // The popup lays out its header, panel and footer as direct children; the
  // form must not add a box between them.
  form: {
    display: "contents",
  },
  fields: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})

/** Rejects one chapter or the selected ones with a note for their uploaders. */
export function RejectChaptersDialog({
  submissions,
  onClose,
  onDone,
}: {
  submissions: readonly ChapterSubmission[] | null
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const reject = useRejectChapters()
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)
  const [only] = submissions ?? []
  const close = () => {
    reject.reset()
    setReason("")
    setTouched(false)
    onClose()
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          close()
        }
      }}
      open={submissions !== null}
    >
      <DialogPopup>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            setTouched(true)

            if (submissions !== null && reason.trim() !== "") {
              reject.mutate(
                {
                  chapterIds: submissions.map((submission) => submission.id),
                  reason: reason.trim(),
                },
                {
                  onSuccess: (result) => {
                    toastReviewResult(result, m.review_bulk_rejected)
                    onDone?.()
                    close()
                  },
                },
              )
            }
          }}
          sx={styles.form}
        >
          <DialogHeader>
            <DialogTitle>
              {submissions?.length === 1 && only !== undefined
                ? m.review_reject_chapter_title({ name: submissionLabel(only) })
                : m.review_reject_chapters_title({ count: submissions?.length ?? 0 })}
            </DialogTitle>
            <DialogDescription>{m.review_reject_chapters_description()}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div sx={styles.fields}>
              <ErrorAlert message={reject.isError ? getErrorMessage(reject.error) : null} />
              <RejectNoteField
                onReasonChange={setReason}
                reason={reason}
                rows={5}
                touched={touched}
              />
            </div>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {m.cancel()}
            </DialogClose>
            <Button loading={reject.isPending} type="submit" variant="destructive">
              {m.review_reject()}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
