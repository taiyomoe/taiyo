import { EyeOff, ThumbsUp } from "@taiyomoe/ui/components/icons"
import { sumBy } from "remeda"
import type { BulkResult } from "@/features/catalog/api/catalog"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { formatNumber } from "@/features/dashboard/lib/format"
import { toastGroupsResult } from "@/features/groups/lib/group-bulk-toast"
import { useDeleteLists } from "@/features/lists/api/lists"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const SKIP_REASONS = {
  NOT_FOUND: m.lists_skipped_not_found,
  FORBIDDEN: m.lists_skipped_forbidden,
}

/**
 * Deletes one list or the selected ones, after listing what goes away with them. The list editor
 * and the dashboard share it, so a list goes the same way for its owner and for a moderator.
 */
export function DeleteListsDialog({
  lists,
  onClose,
  onDone,
}: {
  lists: ReadonlyArray<{ id: string; name: string; upvoteCount: number }> | null
  onClose: () => void
  onDone?: ((result: BulkResult) => void) | undefined
}) {
  const remove = useDeleteLists()
  const upvotes = sumBy(lists ?? [], (list) => list.upvoteCount)
  const [only] = lists ?? []
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (lists !== null) {
          remove.mutate(
            lists.map((list) => list.id),
            {
              onSuccess: (result) => {
                toastGroupsResult(
                  result,
                  lists.length === 1 ? () => m.list_editor_deleted() : m.lists_bulk_deleted,
                  SKIP_REASONS,
                )
                onDone?.(result)
                close()
              },
            },
          )
        }
      }}
      pending={remove.isPending}
      request={
        lists === null
          ? null
          : {
              title:
                lists.length === 1 && only !== undefined
                  ? m.lists_delete_title({ name: only.name })
                  : m.lists_bulk_delete_title({ count: lists.length }),
              description: m.lists_delete_description(),
              consequences: [
                { icon: EyeOff, text: m.lists_delete_impact_page() },
                ...(upvotes === 0
                  ? []
                  : [
                      {
                        icon: ThumbsUp,
                        text: m.lists_delete_impact_upvotes({ count: formatNumber(upvotes) }),
                      },
                    ]),
              ],
              loadError: null,
              restorable: false,
              confirmLabel: m.catalog_delete(),
            }
      }
    />
  )
}
