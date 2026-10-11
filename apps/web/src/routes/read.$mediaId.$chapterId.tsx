import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, createFileRoute, getRouteApi, notFound, useNavigate } from "@tanstack/react-router"
import { Book } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useCallback } from "react"

import { EmptyState } from "@/components/app/empty-state"
import { chapterHeading } from "@/components/media/chapter-label"
import { getMainTitle } from "@/components/media/media-labels"
import { getAdjacentChapters } from "@/components/reader/adjacent-chapters"
import { ReaderEnd } from "@/components/reader/reader-end"
import { ReaderToolbar } from "@/components/reader/reader-toolbar"
import { ReaderViewport } from "@/components/reader/reader-viewport"
import { useCurrentPage } from "@/components/reader/use-current-page"
import { usePreloadPages } from "@/components/reader/use-preload-pages"
import { useReaderKeys } from "@/components/reader/use-reader-keys"
import { useScrollDirectionHidden } from "@/components/reader/use-scroll-direction-hidden"
import { rethrowAsNotFound } from "@/lib/not-found"
import { chapterQueryOptions } from "@/lib/queries/chapters"
import { allMediaChaptersQueryOptions, mediaQueryOptions } from "@/lib/queries/medias"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/read/$mediaId/$chapterId")({
  context: ({ params: { mediaId, chapterId } }) => ({
    chapterQueryOptions: chapterQueryOptions(chapterId),
    mediaQueryOptions: mediaQueryOptions(mediaId),
    chaptersQueryOptions: allMediaChaptersQueryOptions(mediaId),
  }),
  loader: async ({ context, params: { mediaId } }) => {
    void context.queryClient.prefetchQuery(context.chaptersQueryOptions)

    const [chapter, media] = await Promise.all([
      context.queryClient.ensureQueryData(context.chapterQueryOptions),
      context.queryClient.ensureQueryData(context.mediaQueryOptions),
    ]).catch(rethrowAsNotFound(["CHAPTER_NOT_FOUND", "MEDIA_NOT_FOUND", "VALIDATION_ERROR"]))

    if (chapter.mediaId !== mediaId) {
      throw notFound()
    }

    return { title: getMainTitle(media.titles), chapter: chapterHeading(chapter) }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: m.reader_meta_title({ title: loaderData.title, chapter: loaderData.chapter }) }]
      : [],
  }),
  notFoundComponent: ChapterNotFound,
  component: Reader,
})

const routeApi = getRouteApi("/read/$mediaId/$chapterId")
const styles = stylex.create({
  page: {
    backgroundColor: colors.background,
    color: colors.foreground,
    minHeight: "100dvh",
    paddingTop: "5rem",
  },
})

function Reader() {
  const navigate = useNavigate()
  const { mediaId } = routeApi.useParams()
  const context = routeApi.useRouteContext()
  const { data: chapter } = useSuspenseQuery(context.chapterQueryOptions)
  const { data: media } = useSuspenseQuery(context.mediaQueryOptions)
  const { data: chapters } = useSuspenseQuery(context.chaptersQueryOptions)
  const pages = chapter.pages ?? []
  const urls = pages.map((page) => page.url)
  const { current, observe } = useCurrentPage(pages.length)
  const hidden = useScrollDirectionHidden()
  const { previous, next } = getAdjacentChapters(chapters, chapter)

  usePreloadPages(urls, current)
  useReaderKeys({
    onPrevious: useCallback(() => {
      if (previous) {
        void navigate({
          to: "/read/$mediaId/$chapterId",
          params: { mediaId, chapterId: previous.id },
        })
      }
    }, [navigate, mediaId, previous]),
    onNext: useCallback(() => {
      if (next) {
        void navigate({
          to: "/read/$mediaId/$chapterId",
          params: { mediaId, chapterId: next.id },
        })
      }
    }, [navigate, mediaId, next]),
    onExit: useCallback(() => {
      void navigate({ to: "/titles/$mediaId", params: { mediaId } })
    }, [navigate, mediaId]),
  })

  return (
    <main sx={styles.page}>
      <ReaderToolbar
        chapterHeading={chapterHeading(chapter)}
        current={current}
        hidden={hidden}
        mediaId={mediaId}
        mediaTitle={getMainTitle(media.titles)}
        next={next}
        previous={previous}
        total={pages.length}
      />
      {chapter.pages === null || pages.length === 0 ? (
        <EmptyState
          action={
            <Button render={<Link params={{ mediaId }} to="/titles/$mediaId" />} variant="outline">
              {m.reader_back()}
            </Button>
          }
          description={m.reader_no_pages_description()}
          icon={<Book />}
          title={m.reader_no_pages_title()}
        />
      ) : (
        <>
          <ReaderViewport observe={observe} pages={pages} />
          <ReaderEnd
            mediaId={mediaId}
            next={next}
            nextHeading={next ? chapterHeading(next) : null}
          />
        </>
      )}
    </main>
  )
}

function ChapterNotFound() {
  return (
    <main sx={styles.page}>
      <EmptyState
        action={
          <Button render={<Link search={{}} to="/titles" />} variant="outline">
            {m.media_back_to_titles()}
          </Button>
        }
        description={m.reader_not_found_description()}
        icon={<Book />}
        title={m.reader_not_found_title()}
      />
    </main>
  )
}
