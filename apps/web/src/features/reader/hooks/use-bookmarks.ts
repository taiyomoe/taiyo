import { useQuery } from "@tanstack/react-query"
import { mediaBookmarksQueryOptions, useToggleBookmark } from "@/features/reader/api/page-actions"

export function useBookmarks({
  mediaId,
  chapterId,
  pageId,
  signedIn,
}: {
  mediaId: string
  chapterId: string
  pageId: string | undefined
  signedIn: boolean
}) {
  const query = useQuery({ ...mediaBookmarksQueryOptions(mediaId), enabled: signedIn })
  const toggle = useToggleBookmark(mediaId)
  const bookmarks = query.data ?? []
  const pending = toggle.isPending ? toggle.variables : undefined
  const bookmarked =
    pending?.chapterId === chapterId && pending.pageId === pageId
      ? pending.bookmarked
      : bookmarks.some((bookmark) => bookmark.chapterId === chapterId && bookmark.pageId === pageId)

  return {
    bookmarks,
    bookmarked,
    toggle: () => {
      if (signedIn && pageId !== undefined) {
        toggle.mutate({ chapterId, pageId, bookmarked: !bookmarked })
      }
    },
    remove: (target: { chapterId: string; pageId: string }) => {
      toggle.mutate({ ...target, bookmarked: false })
    },
  }
}
