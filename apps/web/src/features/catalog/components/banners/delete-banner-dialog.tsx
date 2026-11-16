import { EyeOff, Image } from "@taiyomoe/ui/components/icons"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { useDeleteBanner } from "@/features/media-images/api/media-images"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type DeletableBanner = {
  id: string
  mediaId: string
  mediaTitle: string | null
  last: boolean
}

export function DeleteBannerDialog({
  banner,
  onClose,
}: {
  banner: DeletableBanner | null
  onClose: () => void
}) {
  const remove = useDeleteBanner(banner?.mediaId ?? "")
  const title = banner?.mediaTitle ?? m.media_untitled()
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (banner !== null) {
          remove.mutate(banner.id, {
            onSuccess: () => {
              toastManager.add({ title: m.catalog_banner_deleted(), type: "success" })
              close()
            },
          })
        }
      }}
      pending={remove.isPending}
      request={
        banner === null
          ? null
          : {
              title: m.catalog_banner_delete_title(),
              description: m.catalog_banner_delete_description({ title }),
              consequences: [
                { icon: EyeOff, text: m.catalog_banner_impact_hidden({ title }) },
                ...(banner.last
                  ? [{ icon: Image, text: m.catalog_banner_impact_last({ title }) }]
                  : []),
              ],
              loadError: null,
              restorable: false,
              confirmLabel: m.catalog_banner_delete_confirm(),
            }
      }
    />
  )
}
