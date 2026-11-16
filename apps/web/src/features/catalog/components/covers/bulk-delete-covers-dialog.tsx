import { EyeOff, Star } from "@taiyomoe/ui/components/icons"
import type { ManagedCover } from "@/features/catalog/api/catalog"
import { useBulkDeleteCovers } from "@/features/catalog/api/catalog"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { formatNumber } from "@/features/dashboard/lib/format"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function BulkDeleteCoversDialog({
  covers,
  onClose,
  onDone,
}: {
  covers: readonly ManagedCover[] | null
  onClose: () => void
  onDone: () => void
}) {
  const remove = useBulkDeleteCovers()
  const deletable = covers?.filter((cover) => !cover.isMainCover) ?? []
  const main = (covers?.length ?? 0) - deletable.length
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        remove.mutate(
          deletable.map((cover) => cover.id),
          {
            onSuccess: (result) => {
              toastBulkResult(result, m.catalog_bulk_deleted)
              onDone()
              close()
            },
          },
        )
      }}
      pending={remove.isPending}
      request={
        covers === null
          ? null
          : {
              title: m.catalog_cover_bulk_delete_title({ count: covers.length }),
              description: m.catalog_cover_bulk_delete_description(),
              consequences: [
                {
                  icon: EyeOff,
                  text: m.catalog_cover_bulk_impact_hidden({
                    count: formatNumber(deletable.length),
                  }),
                },
                ...(main === 0
                  ? []
                  : [
                      {
                        icon: Star,
                        text: m.catalog_cover_bulk_impact_main({ count: formatNumber(main) }),
                      },
                    ]),
              ],
              loadError: null,
              restorable: false,
              blockedReason: deletable.length === 0 ? m.catalog_cover_bulk_all_main() : undefined,
              confirmLabel: m.catalog_cover_bulk_delete_confirm(),
            }
      }
    />
  )
}
