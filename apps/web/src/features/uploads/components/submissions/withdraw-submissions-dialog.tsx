import { Image, ListNumbered } from "@taiyomoe/ui/components/icons"
import { sumBy } from "remeda"
import type { ChapterSubmission } from "@/features/uploads/api/submissions"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { formatNumber } from "@/features/dashboard/lib/format"
import { useWithdrawChapters } from "@/features/uploads/api/submissions"
import { submissionLabel } from "@/features/uploads/components/submission-cells"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

/** Withdraws one submission or the selected ones, deleting them with their pages. */
export function WithdrawSubmissionsDialog({
  submissions,
  onClose,
  onDone,
}: {
  submissions: readonly ChapterSubmission[] | null
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const withdraw = useWithdrawChapters()
  const [only] = submissions ?? []
  const pages = sumBy(submissions ?? [], (submission) => submission.pageCount)
  const close = () => {
    withdraw.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={withdraw.isError ? getErrorMessage(withdraw.error) : null}
      onClose={close}
      onConfirm={() => {
        if (submissions !== null) {
          withdraw.mutate(
            submissions.map((submission) => submission.id),
            {
              onSuccess: (result) => {
                toastBulkResult(result, m.submissions_bulk_withdrawn)
                onDone?.()
                close()
              },
            },
          )
        }
      }}
      pending={withdraw.isPending}
      request={
        submissions === null
          ? null
          : {
              title:
                submissions.length === 1 && only !== undefined
                  ? m.submissions_withdraw_title({ name: submissionLabel(only) })
                  : m.submissions_withdraw_title_many({ count: submissions.length }),
              description: m.submissions_withdraw_description(),
              consequences: [
                {
                  icon: ListNumbered,
                  text: m.submissions_withdraw_impact_chapters({
                    count: formatNumber(submissions.length),
                  }),
                },
                ...(pages === 0
                  ? []
                  : [
                      {
                        icon: Image,
                        text: m.submissions_withdraw_impact_pages({ count: formatNumber(pages) }),
                      },
                    ]),
              ],
              loadError: null,
              restorable: false,
              confirmLabel: m.submission_withdraw(),
            }
      }
    />
  )
}
