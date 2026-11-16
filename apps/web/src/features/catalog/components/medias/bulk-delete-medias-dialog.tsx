import { useQuery } from "@tanstack/react-query"
import {
  mediasDeletionImpactQueryOptions,
  useBulkDeleteMedias,
} from "@/features/catalog/api/catalog"
import { getMediaConsequences } from "@/features/catalog/components/medias/delete-media-dialog"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { formatNumber } from "@/features/dashboard/lib/format"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function BulkDeleteMediasDialog({
  mediaIds,
  onClose,
  onDone,
}: {
  mediaIds: readonly string[] | null
  onClose: () => void
  onDone: () => void
}) {
  const impact = useQuery({
    ...mediasDeletionImpactQueryOptions(mediaIds ?? []),
    enabled: mediaIds !== null,
  })
  const remove = useBulkDeleteMedias()
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (mediaIds !== null) {
          remove.mutate([...mediaIds], {
            onSuccess: (result) => {
              toastBulkResult(result, m.catalog_bulk_deleted)
              onDone()
              close()
            },
          })
        }
      }}
      pending={remove.isPending}
      request={
        mediaIds === null
          ? null
          : {
              title: m.catalog_media_bulk_delete_title({ count: mediaIds.length }),
              description: m.catalog_media_bulk_delete_description(),
              consequences:
                impact.data === undefined
                  ? undefined
                  : getMediaConsequences(impact.data, {
                      hidden: m.catalog_media_bulk_impact_hidden(),
                      featured:
                        impact.data.featured === 0
                          ? null
                          : m.catalog_media_bulk_impact_featured({
                              count: formatNumber(impact.data.featured),
                            }),
                    }),
              loadError: impact.isError ? getErrorMessage(impact.error) : null,
              restorable: true,
              confirmLabel: m.catalog_media_bulk_delete_confirm(),
            }
      }
    />
  )
}
