import { EyeOff, Image } from "@taiyomoe/ui/components/icons"
import type { ManagedBanner } from "@/features/catalog/api/catalog"
import { useBulkDeleteBanners } from "@/features/catalog/api/catalog"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { formatNumber } from "@/features/dashboard/lib/format"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

/** The media whose every banner is in the selection, so it ends up with none. */
const countEmptiedMedia = (banners: readonly ManagedBanner[]) => {
  const picked = new Map<string, { picked: number; total: number }>()

  for (const banner of banners) {
    const entry = picked.get(banner.media.id) ?? { picked: 0, total: banner.media.imageCount }

    picked.set(banner.media.id, { ...entry, picked: entry.picked + 1 })
  }

  return [...picked.values()].filter((entry) => entry.picked >= entry.total).length
}

export function BulkDeleteBannersDialog({
  banners,
  onClose,
  onDone,
}: {
  banners: readonly ManagedBanner[] | null
  onClose: () => void
  onDone: () => void
}) {
  const remove = useBulkDeleteBanners()
  const emptied = banners === null ? 0 : countEmptiedMedia(banners)
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (banners !== null) {
          remove.mutate(
            banners.map((banner) => banner.id),
            {
              onSuccess: (result) => {
                toastBulkResult(result, m.catalog_bulk_deleted)
                onDone()
                close()
              },
            },
          )
        }
      }}
      pending={remove.isPending}
      request={
        banners === null
          ? null
          : {
              title: m.catalog_banner_bulk_delete_title({ count: banners.length }),
              description: m.catalog_banner_bulk_delete_description(),
              consequences: [
                {
                  icon: EyeOff,
                  text: m.catalog_banner_bulk_impact_hidden({
                    count: formatNumber(banners.length),
                  }),
                },
                ...(emptied === 0
                  ? []
                  : [
                      {
                        icon: Image,
                        text: m.catalog_banner_bulk_impact_last({ count: formatNumber(emptied) }),
                      },
                    ]),
              ],
              loadError: null,
              restorable: false,
              confirmLabel: m.catalog_banner_bulk_delete_confirm(),
            }
      }
    />
  )
}
