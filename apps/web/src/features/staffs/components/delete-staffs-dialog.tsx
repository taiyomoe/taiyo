import { Library, Search } from "@taiyomoe/ui/components/icons"
import { sumBy } from "remeda"
import type { ManagedStaff } from "@/features/staffs/api/staffs"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { formatNumber } from "@/features/dashboard/lib/format"
import { useDeleteStaffs } from "@/features/staffs/api/staffs"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

/** Deletes one staff or the selected ones, after listing what goes away with them. */
export function DeleteStaffsDialog({
  staffs,
  onClose,
  onDone,
}: {
  staffs: readonly ManagedStaff[] | null
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const remove = useDeleteStaffs()
  const credits = sumBy(staffs ?? [], (staff) => staff.mediaCount)
  const [only] = staffs ?? []
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (staffs !== null) {
          remove.mutate(
            staffs.map((staff) => staff.id),
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
        staffs === null
          ? null
          : {
              title:
                staffs.length === 1 && only !== undefined
                  ? m.staffs_delete_title({ name: only.name })
                  : m.staffs_bulk_delete_title({ count: staffs.length }),
              description: m.staffs_delete_description(),
              consequences: [
                { icon: Search, text: m.staffs_delete_impact_search() },
                ...(credits === 0
                  ? []
                  : [
                      {
                        icon: Library,
                        text: m.staffs_delete_impact_credits({ count: formatNumber(credits) }),
                      },
                    ]),
              ],
              loadError: null,
              restorable: false,
              confirmLabel: m.staffs_delete_confirm(),
            }
      }
    />
  )
}
