import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { Navigate } from "@tanstack/react-router"
import { useState } from "react"
import type { Session } from "@/lib/session"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { chapterReaderQueryOptions } from "@/features/reader/api/reader"
import { Reader } from "@/features/reader/components/reader"
import { ReaderEmpty } from "@/features/reader/components/reader-empty"
import { ReaderSplash } from "@/features/reader/components/reader-splash"
import {
  useReaderSettings,
  useReaderSettingsSync,
} from "@/features/reader/hooks/use-reader-settings"
import { chapterQueryOptions } from "@/features/uploads/api/submissions"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export function ChapterReader({
  chapterId: routeChapterId,
  requestedPage,
  signedIn,
  sheetOpen,
  onSheetOpenChange,
  onSessionChapters,
  viewer,
  linkedCommentId,
}: {
  chapterId: string
  requestedPage: number | undefined
  signedIn: boolean
  sheetOpen: boolean
  onSheetOpenChange: (open: boolean) => void
  onSessionChapters: (chapters: readonly string[]) => void
  viewer: Session["user"] | null
  linkedCommentId: string | null
}) {
  const [chapterId] = useState(routeChapterId)
  const { contentRatings } = useSettings()
  const { data: chapter } = useSuspenseQuery(chapterQueryOptions(chapterId))
  const { data } = useSuspenseQuery(chapterReaderQueryOptions(chapterId, contentRatings))
  const media = useQuery(mediaQueryOptions(chapter.mediaId))
  const longStrip = media.data?.type === "MANHWA" || media.data?.type === "MANHUA"
  const { settings } = useReaderSettings(longStrip, signedIn)

  useReaderSettingsSync(signedIn)

  const pages = chapter.pages ?? []

  if (chapter.isExternal) {
    return <Navigate params={{ chapterId }} replace to="/chapters/$chapterId/source" />
  }

  if (media.isPending) {
    return <ReaderSplash />
  }

  if (pages.length === 0) {
    return <ReaderEmpty mediaId={chapter.mediaId} />
  }

  const history = data.history
  const resumeIndex =
    settings.resume && history !== null && !history.completed && history.pageId !== null
      ? pages.findIndex((page) => page.id === history.pageId)
      : -1
  const initialPage =
    requestedPage === undefined
      ? Math.max(resumeIndex, 0)
      : Math.min(Math.max(requestedPage - 1, 0), pages.length - 1)

  return (
    <Reader
      data={data}
      entry={{ ...chapter, pages }}
      initialPage={initialPage}
      linkedCommentId={linkedCommentId}
      longStrip={longStrip}
      mediaTitle={
        (media.data === undefined ? null : getMainTitle(media.data.titles)) ?? m.media_untitled()
      }
      onSessionChapters={onSessionChapters}
      onSheetOpenChange={onSheetOpenChange}
      sheetOpen={sheetOpen}
      signedIn={signedIn}
      viewer={viewer}
    />
  )
}
