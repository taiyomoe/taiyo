import { EyeOff, Image } from "@taiyomoe/ui/components/icons"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { useDeleteCover } from "@/features/media-images/api/media-images"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type DeletableCover = {
  id: string
  mediaId: string
  mediaTitle: string | null
  volume: string | null
  isMainCover: boolean
}

export function DeleteCoverDialog({
  cover,
  onClose,
}: {
  cover: DeletableCover | null
  onClose: () => void
}) {
  const remove = useDeleteCover(cover?.mediaId ?? "")
  const title = cover?.mediaTitle ?? m.media_untitled()
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (cover !== null) {
          remove.mutate(cover.id, {
            onSuccess: () => {
              toastManager.add({ title: m.catalog_cover_deleted(), type: "success" })
              close()
            },
          })
        }
      }}
      pending={remove.isPending}
      request={
        cover === null
          ? null
          : {
              title: m.media_covers_delete_title(),
              description: m.catalog_cover_delete_description({ title }),
              consequences: [
                { icon: EyeOff, text: m.catalog_cover_impact_hidden({ title }) },
                ...(cover.volume === null
                  ? []
                  : [
                      {
                        icon: Image,
                        text: m.catalog_cover_impact_volume({ volume: cover.volume }),
                      },
                    ]),
              ],
              loadError: null,
              restorable: false,
              blockedReason: cover.isMainCover ? m.catalog_cover_delete_main({ title }) : undefined,
              confirmLabel: m.catalog_cover_delete_confirm(),
            }
      }
    />
  )
}
