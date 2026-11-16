import { EyeOff, ListNumbered, Users } from "@taiyomoe/ui/components/icons"
import { sumBy } from "remeda"
import type { ManagedGroup } from "@/features/groups/api/groups"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { formatNumber } from "@/features/dashboard/lib/format"
import { useDeleteGroups } from "@/features/groups/api/groups"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

/** Deletes one group or the selected ones, after listing what goes away with them. */
export function DeleteGroupsDialog({
  groups,
  onClose,
  onDone,
}: {
  groups: readonly ManagedGroup[] | null
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const remove = useDeleteGroups()
  const members = sumBy(groups ?? [], (group) => group.memberCount)
  const chapters = sumBy(groups ?? [], (group) => group.chapterCount)
  const [only] = groups ?? []
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (groups !== null) {
          remove.mutate(
            groups.map((group) => group.id),
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
        groups === null
          ? null
          : {
              title:
                groups.length === 1 && only !== undefined
                  ? m.all_groups_delete_title({ name: only.name })
                  : m.all_groups_bulk_delete_title({ count: groups.length }),
              description: m.all_groups_delete_description(),
              consequences: [
                { icon: EyeOff, text: m.all_groups_delete_impact_page() },
                ...(members === 0
                  ? []
                  : [
                      {
                        icon: Users,
                        text: m.all_groups_delete_impact_members({ count: formatNumber(members) }),
                      },
                    ]),
                ...(chapters === 0
                  ? []
                  : [
                      {
                        icon: ListNumbered,
                        text: m.all_groups_delete_impact_chapters({
                          count: formatNumber(chapters),
                        }),
                      },
                    ]),
              ],
              loadError: null,
              restorable: false,
              confirmLabel: m.all_groups_delete_confirm(),
            }
      }
    />
  )
}
