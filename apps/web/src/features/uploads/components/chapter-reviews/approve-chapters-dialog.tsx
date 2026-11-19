import type { ChapterSubmission } from "@/features/uploads/api/submissions"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { useApproveChapters } from "@/features/uploads/api/submissions"
import { submissionLabel } from "@/features/uploads/components/submission-cells"
import { toastReviewResult } from "@/features/uploads/lib/review-toast"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

/** Approves one chapter or the selected ones as they are, without the fixes of the review. */
export function ApproveChaptersDialog({
  submissions,
  onClose,
  onDone,
}: {
  submissions: readonly ChapterSubmission[] | null
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const approve = useApproveChapters()
  const [only] = submissions ?? []

  return (
    <ConfirmDialog
      confirmation={
        submissions === null
          ? null
          : {
              title:
                submissions.length === 1 && only !== undefined
                  ? m.review_approve_title({ name: submissionLabel(only) })
                  : m.review_approve_title_many({ count: submissions.length }),
              description: m.review_approve_description(),
              confirmLabel: m.review_approve(),
              run: async () => {
                const result = await approve.mutateAsync(
                  submissions.map((submission) => submission.id),
                )

                toastReviewResult(result, m.review_bulk_approved)
                onDone?.()
              },
            }
      }
      error={approve.isError ? getErrorMessage(approve.error) : null}
      onClose={() => {
        onClose()
        approve.reset()
      }}
      pending={approve.isPending}
    />
  )
}
