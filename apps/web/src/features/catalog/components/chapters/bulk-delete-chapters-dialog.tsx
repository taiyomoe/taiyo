import { useQuery } from "@tanstack/react-query"
import {
  chaptersDeletionImpactQueryOptions,
  useBulkDeleteChapters,
} from "@/features/catalog/api/catalog"
import { getChapterConsequences } from "@/features/catalog/components/chapters/delete-chapter-dialog"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function BulkDeleteChaptersDialog({
  chapterIds,
  onClose,
  onDone,
}: {
  chapterIds: readonly string[] | null
  onClose: () => void
  onDone: () => void
}) {
  const impact = useQuery({
    ...chaptersDeletionImpactQueryOptions(chapterIds ?? []),
    enabled: chapterIds !== null,
  })
  const remove = useBulkDeleteChapters()
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (chapterIds !== null) {
          remove.mutate([...chapterIds], {
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
        chapterIds === null
          ? null
          : {
              title: m.catalog_chapter_bulk_delete_title({ count: chapterIds.length }),
              description: m.catalog_chapter_bulk_delete_description(),
              consequences:
                impact.data === undefined
                  ? undefined
                  : getChapterConsequences(impact.data, m.catalog_chapter_bulk_impact_hidden()),
              loadError: impact.isError ? getErrorMessage(impact.error) : null,
              restorable: false,
              confirmLabel: m.catalog_chapter_bulk_delete_confirm(),
            }
      }
    />
  )
}
