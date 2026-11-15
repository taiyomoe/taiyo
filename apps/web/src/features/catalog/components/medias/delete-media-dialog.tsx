import {
  Book,
  Comment,
  EyeOff,
  FileEdit,
  Flag,
  History,
  Image,
  Library,
  List,
  Sparkles,
  Upload,
} from "@taiyomoe/ui/components/icons"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import type { DeleteConsequence } from "@/features/catalog/components/shared/delete-dialog"
import {
  type MediaDeletionImpact,
  mediaDeletionImpactQueryOptions,
  useDeleteMedia,
} from "@/features/catalog/api/catalog"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { formatNumber } from "@/features/dashboard/lib/format"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type DeletableMedia = { id: string; title: string | null }

const getConsequences = (impact: MediaDeletionImpact) => {
  const counted = (
    count: number,
    icon: DeleteConsequence["icon"],
    text: (count: string) => string,
  ) => (count === 0 ? [] : [{ icon, text: text(formatNumber(count)) }])

  return [
    { icon: EyeOff, text: m.catalog_media_impact_hidden() },
    ...counted(impact.publishedChapters, Book, (count) =>
      m.catalog_media_impact_chapters({ count }),
    ),
    ...counted(impact.unpublishedChapters, Upload, (count) =>
      m.catalog_media_impact_unpublished({ count }),
    ),
    ...counted(impact.covers + impact.banners, Image, (count) =>
      m.catalog_media_impact_images({ count }),
    ),
    ...counted(impact.libraryEntries, Library, (count) =>
      m.catalog_media_impact_libraries({ count }),
    ),
    ...counted(impact.lists, List, (count) => m.catalog_media_impact_lists({ count })),
    ...counted(impact.readers, History, (count) => m.catalog_media_impact_readers({ count })),
    ...counted(impact.comments, Comment, (count) => m.catalog_media_impact_comments({ count })),
    ...counted(impact.pendingSuggestions, FileEdit, (count) =>
      m.catalog_media_impact_suggestions({ count }),
    ),
    ...counted(impact.openPageReports, Flag, (count) => m.catalog_media_impact_reports({ count })),
    ...(impact.featured ? [{ icon: Sparkles, text: m.catalog_media_impact_featured() }] : []),
  ] satisfies DeleteConsequence[]
}

export function DeleteMediaDialog({
  media,
  onClose,
}: {
  media: DeletableMedia | null
  onClose: () => void
}) {
  const impact = useQuery({
    ...mediaDeletionImpactQueryOptions(media?.id ?? ""),
    enabled: media !== null,
  })
  const remove = useDeleteMedia()
  const title = media?.title ?? m.media_untitled()
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (media !== null) {
          remove.mutate(media.id, {
            onSuccess: () => {
              toastManager.add({ title: m.catalog_media_deleted({ title }), type: "success" })
              close()
            },
          })
        }
      }}
      pending={remove.isPending}
      request={
        media === null
          ? null
          : {
              title: m.catalog_media_delete_title({ title }),
              description: m.catalog_media_delete_description(),
              consequences: impact.data === undefined ? undefined : getConsequences(impact.data),
              loadError: impact.isError ? getErrorMessage(impact.error) : null,
              restorable: true,
              confirmLabel: m.catalog_media_delete_confirm(),
            }
      }
    />
  )
}
