import { CheckCircle, EyeOff, Reply } from "@taiyomoe/ui/components/icons"
import { sumBy } from "remeda"
import type { ManagedComment } from "@/features/comments/api/managed-comments"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { useDeleteComments } from "@/features/comments/api/managed-comments"
import { formatNumber } from "@/features/dashboard/lib/format"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

/** Removes one comment or the selected ones, the way a moderator removes them from their page. */
export function DeleteCommentsDialog({
  comments,
  onClose,
  onDone,
}: {
  comments: ReadonlyArray<Pick<ManagedComment, "id" | "replyCount">> | null
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const remove = useDeleteComments()
  const replies = sumBy(comments ?? [], (comment) => comment.replyCount)
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (comments !== null) {
          remove.mutate(
            comments.map((comment) => comment.id),
            {
              onSuccess: (result) => {
                toastBulkResult(result, m.catalog_bulk_deleted)
                onDone?.()
                close()
              },
            },
          )
        }
      }}
      pending={remove.isPending}
      request={
        comments === null
          ? null
          : {
              title:
                comments.length === 1
                  ? m.comments_delete_title()
                  : m.comments_bulk_delete_title({ count: comments.length }),
              description: m.comments_delete_description(),
              consequences: [
                { icon: EyeOff, text: m.comments_delete_impact_hidden() },
                ...(replies === 0
                  ? []
                  : [
                      {
                        icon: Reply,
                        text: m.comments_delete_impact_replies({ count: formatNumber(replies) }),
                      },
                    ]),
                { icon: CheckCircle, text: m.comments_delete_impact_reports() },
              ],
              loadError: null,
              restorable: false,
              confirmLabel: m.comments_delete_confirm(),
            }
      }
    />
  )
}
