import {
  Bookmark,
  Comment,
  EyeOff,
  Flag,
  History,
  Image,
  Users,
} from "@taiyomoe/ui/components/icons"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import type { DeleteConsequence } from "@/features/catalog/components/shared/delete-dialog"
import {
  type ChapterDeletionImpact,
  chapterDeletionImpactQueryOptions,
  useDeleteChapter,
} from "@/features/catalog/api/catalog"
import { DeleteDialog } from "@/features/catalog/components/shared/delete-dialog"
import { formatNumber } from "@/features/dashboard/lib/format"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type DeletableChapter = { id: string; label: string }

/** What deleting chapters takes off the site; the first line depends on how many. */
export const getChapterConsequences = (impact: ChapterDeletionImpact, hidden: string) => {
  const counted = (
    count: number,
    icon: DeleteConsequence["icon"],
    text: (count: string) => string,
  ) => (count === 0 ? [] : [{ icon, text: text(formatNumber(count)) }])

  return [
    { icon: EyeOff, text: hidden },
    ...counted(impact.pages, Image, (count) => m.catalog_chapter_impact_pages({ count })),
    ...counted(impact.readers, History, (count) => m.catalog_chapter_impact_readers({ count })),
    ...counted(impact.bookmarks, Bookmark, (count) =>
      m.catalog_chapter_impact_bookmarks({ count }),
    ),
    ...counted(impact.comments, Comment, (count) => m.catalog_chapter_impact_comments({ count })),
    ...counted(impact.openPageReports, Flag, (count) =>
      m.catalog_chapter_impact_reports({ count }),
    ),
    ...counted(impact.groups, Users, (count) => m.catalog_chapter_impact_groups({ count })),
  ] satisfies DeleteConsequence[]
}

export function DeleteChapterDialog({
  chapter,
  onClose,
}: {
  chapter: DeletableChapter | null
  onClose: () => void
}) {
  const impact = useQuery({
    ...chapterDeletionImpactQueryOptions(chapter?.id ?? ""),
    enabled: chapter !== null,
  })
  const remove = useDeleteChapter()
  const close = () => {
    remove.reset()
    onClose()
  }

  return (
    <DeleteDialog
      error={remove.isError ? getErrorMessage(remove.error) : null}
      onClose={close}
      onConfirm={() => {
        if (chapter !== null) {
          remove.mutate(chapter.id, {
            onSuccess: () => {
              toastManager.add({
                title: m.catalog_chapter_deleted({ chapter: chapter.label }),
                type: "success",
              })
              close()
            },
          })
        }
      }}
      pending={remove.isPending}
      request={
        chapter === null
          ? null
          : {
              title: m.catalog_chapter_delete_title({ chapter: chapter.label }),
              description: m.catalog_chapter_delete_description(),
              consequences:
                impact.data === undefined
                  ? undefined
                  : getChapterConsequences(impact.data, m.catalog_chapter_impact_hidden()),
              loadError: impact.isError ? getErrorMessage(impact.error) : null,
              restorable: false,
              confirmLabel: m.catalog_chapter_delete_confirm(),
            }
      }
    />
  )
}
