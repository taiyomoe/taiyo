import { READER_MODES } from "@taiyomoe/schemas/reader-settings"
import { noop, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type {
  ChapterReaderData,
  ReaderChapter,
  ReaderChapterDetail,
} from "@/features/reader/api/reader"
import { getChapterLabel } from "@/features/chapters/lib/chapter-label"
import {
  type ChapterBoundary,
  ChapterBoundaryDialog,
} from "@/features/reader/components/chapter-boundary-dialog"
import { ReaderToolbar } from "@/features/reader/components/chrome/reader-toolbar"
import { ReaderProgress } from "@/features/reader/components/progress/reader-progress"
import { ReaderHistoryTracker } from "@/features/reader/components/reader-history-tracker"
import { ReportPageDialog } from "@/features/reader/components/report-page-dialog"
import { ReaderSheet } from "@/features/reader/components/sheet/reader-sheet"
import { PagedView } from "@/features/reader/components/stage/paged-view"
import { ReaderStage } from "@/features/reader/components/stage/reader-stage"
import { getPageKey, StripView } from "@/features/reader/components/stage/strip-view"
import { useAutoScroll } from "@/features/reader/hooks/use-auto-scroll"
import { useBookmarks } from "@/features/reader/hooks/use-bookmarks"
import { useFullscreen } from "@/features/reader/hooks/use-fullscreen"
import { useIdle } from "@/features/reader/hooks/use-idle"
import { usePagePreloader } from "@/features/reader/hooks/use-page-preloader"
import { usePageZoom } from "@/features/reader/hooks/use-page-zoom"
import { useReaderKeyboard } from "@/features/reader/hooks/use-reader-keyboard"
import { useReaderNavigation } from "@/features/reader/hooks/use-reader-navigation"
import { useReaderSettings } from "@/features/reader/hooks/use-reader-settings"
import { getSideStep, type ReaderStep } from "@/features/reader/lib/reader-input"
import {
  getAdjacentChapter,
  getChapterChoices,
  getChapterVersions,
  hasChapterGap,
} from "@/features/reader/lib/reader-navigation"
import { chapterQueryOptions } from "@/features/uploads/api/submissions"

const IDLE_TIMEOUT = 2500
const KEPT_PREVIOUS_CHAPTERS = 1
const ZOOM_STEP = 1.5

type ReaderSegment = ReaderChapterDetail & { pages: NonNullable<ReaderChapterDetail["pages"]> }

export function Reader({
  entry,
  data,
  mediaTitle,
  initialPage,
  longStrip,
  signedIn,
  sheetOpen,
  onSheetOpenChange,
  onSessionChapters,
}: {
  entry: ReaderSegment
  data: ChapterReaderData
  mediaTitle: string
  initialPage: number
  longStrip: boolean
  signedIn: boolean
  sheetOpen: boolean
  onSheetOpenChange: (open: boolean) => void
  onSessionChapters: (chapters: readonly string[]) => void
}) {
  const controls = useReaderSettings(longStrip, signedIn)
  const { settings, update } = controls
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const fullscreen = useFullscreen()
  const stage = useRef<HTMLElement | null>(null)
  const pageElements = useRef(new Map<string, HTMLElement>())
  const scrollAnchor = useRef<{ element: HTMLElement; top: number } | null>(null)
  const [segments, setSegments] = useState<readonly ReaderSegment[]>(() => [entry])
  const [activeId, setActiveId] = useState(entry.id)
  const [positions, setPositions] = useState<ReadonlyMap<string, number>>(() => new Map())
  const [loadedPages, setLoadedPages] = useState<ReadonlySet<string>>(() => new Set())
  const [boundary, setBoundary] = useState<
    (ChapterBoundary & { chapter: ReaderChapter | null }) | null
  >(null)
  const [boundaryOpen, setBoundaryOpen] = useState(false)
  const [autoScrolling, setAutoScrolling] = useState(false)
  const [reporting, setReporting] = useState<{
    chapterId: string
    pageId: string
    page: number
    chapterLabel: string
  } | null>(null)
  const chapter = segments.find((segment) => segment.id === activeId) ?? entry
  const urls = useMemo(() => chapter.pages.map((page) => page.url), [chapter.pages])
  const pageCount = urls.length
  const strip = settings.mode === "strip"
  const loaded = useMemo(
    () =>
      new Set(
        urls.flatMap((_, index) => (loadedPages.has(getPageKey(chapter.id, index)) ? [index] : [])),
      ),
    [chapter.id, loadedPages, urls],
  )
  const current = useMemo(
    () =>
      data.chapters.find((row) => row.id === chapter.id) ?? {
        ...chapter,
        pageCount,
        groups: [],
      },
    [chapter, data.chapters, pageCount],
  )
  const prev = getAdjacentChapter(data.chapters, current, "prev")
  const next = getAdjacentChapter(data.chapters, current, "next")
  const choices = useMemo(() => getChapterChoices(data.chapters, current), [data.chapters, current])
  const versions = useMemo(
    () => getChapterVersions(data.chapters, current),
    [data.chapters, current],
  )
  const currentLabel = getChapterLabel(current)
  const lastSegmentId = segments.at(-1)?.id ?? chapter.id
  const endNext =
    lastSegmentId === current.id
      ? next
      : getAdjacentChapter(
          data.chapters,
          data.chapters.find((row) => row.id === lastSegmentId) ?? current,
          "next",
        )
  const stripSegments = useMemo(
    () =>
      segments.map((segment) => ({
        id: segment.id,
        label: getChapterLabel(segment),
        title: segment.title,
        urls: segment.pages.map((page) => page.url),
      })),
    [segments],
  )
  const openChapter = (target: ReaderChapter | null, page?: number) => {
    onSessionChapters([])

    if (target === null) {
      void navigate({ to: "/media/$mediaId", params: { mediaId: chapter.mediaId } })
    } else if (target.isExternal) {
      void navigate({ to: "/chapters/$chapterId/source", params: { chapterId: target.id } })
    } else {
      void navigate({
        to: "/chapters/$chapterId",
        params: { chapterId: target.id },
        search: { page },
      })
    }
  }
  const requestBoundary = (step: ReaderStep) => {
    const target = step === "next" ? next : prev
    const gap = target !== null && hasChapterGap(current.number, target.number)
    const page = step === "prev" && target !== null ? target.pageCount : undefined

    if (!settings.confirmChapterChange && !(gap && settings.warnChapterGap)) {
      openChapter(target, page)

      return
    }

    setAutoScrolling(false)
    setBoundary({
      step,
      chapter: target,
      currentLabel,
      target:
        target === null ? null : { label: getChapterLabel(target), isExternal: target.isExternal },
      gap: target !== null && gap ? { from: currentLabel, to: getChapterLabel(target) } : null,
    })
    setBoundaryOpen(true)
  }
  const navigation = useReaderNavigation({
    chapterId: chapter.id,
    pageCount,
    initialPage,
    settings,
    stage,
    getPageElement: (index) => pageElements.current.get(getPageKey(chapter.id, index)),
    onBoundary: requestBoundary,
  })
  const first = Math.min(...navigation.visible)
  const last = Math.max(...navigation.visible)
  const currentPageId = chapter.pages[navigation.page]?.id
  const bookmarks = useBookmarks({
    mediaId: chapter.mediaId,
    chapterId: chapter.id,
    pageId: currentPageId,
    signedIn,
  })
  const zoom = usePageZoom({
    stage,
    enabled: !strip,
    resetKey: `${chapter.id}:${navigation.visible.join(",")}`,
  })
  const idle = useIdle(IDLE_TIMEOUT, settings.autoHideControls && !sheetOpen && !boundaryOpen)
  const markLoaded = (chapterId: string, index: number, aspect: number) => {
    const key = getPageKey(chapterId, index)

    if (chapterId === chapter.id) {
      navigation.markLoaded(index, aspect)
    }

    setLoadedPages((previous) => (previous.has(key) ? previous : new Set(previous).add(key)))
  }
  const showPage = (chapterId: string, index: number) => {
    const position = segments.findIndex((segment) => segment.id === chapterId)

    if (position === -1) {
      return
    }

    if (chapterId !== chapter.id) {
      const dropped = Math.max(position - KEPT_PREVIOUS_CHAPTERS, 0)
      const anchor = pageElements.current.get(getPageKey(chapterId, index))

      if (dropped > 0 && anchor !== undefined) {
        scrollAnchor.current = { element: anchor, top: anchor.getBoundingClientRect().top }
      }

      const passed = position > segments.findIndex((segment) => segment.id === chapter.id)

      setPositions((previous) =>
        new Map(previous).set(chapter.id, passed ? pageCount - 1 : navigation.page),
      )
      setSegments((previous) => previous.slice(dropped))
      setActiveId(chapterId)
      onSessionChapters(segments.slice(dropped).map((segment) => segment.id))
    }

    navigation.setPageFromScroll(index)
  }

  usePagePreloader({
    urls,
    first,
    last,
    ahead: settings.preload,
    enabled: !strip,
    paused: navigation.visible.some((index) => !loaded.has(index)),
    onLoad: (index, aspect) => {
      markLoaded(chapter.id, index, aspect)
    },
  })
  useAutoScroll({
    stage,
    active: strip && autoScrolling,
    speed: settings.autoScrollSpeed,
    onEnd: () => {
      setAutoScrolling(false)
    },
  })
  useReaderKeyboard({
    enabled: !sheetOpen && !boundaryOpen && reporting === null,
    onAction: (action, event) => {
      const element = stage.current

      switch (action) {
        case "left":

        case "right": {
          event.preventDefault()
          navigation.step(getSideStep(action, settings.direction))

          break
        }

        case "next":

        case "prev": {
          const canScroll =
            element !== null &&
            (action === "next"
              ? element.scrollTop + element.clientHeight < element.scrollHeight - 2
              : element.scrollTop > 0)

          if (!strip && canScroll) {
            return
          }

          event.preventDefault()
          navigation.step(action)

          break
        }

        case "first":

        case "last": {
          event.preventDefault()
          navigation.goTo(action === "first" ? 0 : pageCount - 1)

          break
        }

        case "prevChapter":

        case "nextChapter": {
          const target = action === "prevChapter" ? prev : next

          if (target !== null) {
            openChapter(target)
          }

          break
        }

        case "menu": {
          onSheetOpenChange(true)

          break
        }

        case "fullscreen": {
          fullscreen.toggle()

          break
        }

        case "cycleMode": {
          update({
            mode:
              READER_MODES[(READER_MODES.indexOf(settings.mode) + 1) % READER_MODES.length] ??
              "single",
          })

          break
        }

        case "autoScroll": {
          if (strip) {
            setAutoScrolling((value) => !value)
          }

          break
        }

        case "zoomIn":

        case "zoomOut": {
          event.preventDefault()
          zoom.zoomBy(action === "zoomIn" ? ZOOM_STEP : 1 / ZOOM_STEP)

          break
        }

        case "zoomReset": {
          zoom.reset()

          break
        }

        case "bookmark": {
          bookmarks.toggle()

          break
        }
      }
    },
  })

  useEffect(() => {
    stage.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    void navigate({
      to: "/chapters/$chapterId",
      params: { chapterId: chapter.id },
      search: { page: navigation.page === 0 ? undefined : navigation.page + 1 },
      replace: true,
      resetScroll: false,
    })
  }, [chapter.id, navigate, navigation.page])

  useLayoutEffect(() => {
    const anchor = scrollAnchor.current

    scrollAnchor.current = null

    if (anchor !== null && stage.current !== null) {
      stage.current.scrollTop += anchor.element.getBoundingClientRect().top - anchor.top
    }
  }, [segments])

  const continueTo =
    strip &&
    settings.continuous &&
    chapter.id === lastSegmentId &&
    last >= pageCount - 3 &&
    next !== null &&
    !next.isExternal &&
    next.pageCount > 0 &&
    !(settings.warnChapterGap && hasChapterGap(current.number, next.number))
      ? next.id
      : null

  useEffect(() => {
    if (continueTo === null) {
      return undefined
    }

    let cancelled = false
    const append = async () => {
      const detail = await queryClient.query(chapterQueryOptions(continueTo))
      const pages = detail.pages ?? []

      if (cancelled || pages.length === 0 || detail.isExternal) {
        return
      }

      setSegments((previous) =>
        previous.some((segment) => segment.id === detail.id)
          ? previous
          : [...previous, { ...detail, pages }],
      )
    }

    append().catch(noop)

    return () => {
      cancelled = true
    }
  }, [continueTo, queryClient])

  useEffect(() => {
    if (last >= pageCount - 2 && next !== null && !next.isExternal) {
      void router
        .preloadRoute({ to: "/chapters/$chapterId", params: { chapterId: next.id } })
        .catch(() => {})
    }
  }, [last, next, pageCount, router])

  return (
    <>
      <ReaderStage
        hideCursor={idle}
        onMenu={() => {
          onSheetOpenChange(true)
        }}
        onStep={(step) => {
          setAutoScrolling(false)
          navigation.step(step)
        }}
        ref={stage}
        settings={settings}
        strip={strip}
        zoom={zoom}
      >
        {strip ? (
          <StripView
            initial={{ chapterId: chapter.id, page: navigation.page }}
            nextLabel={endNext === null ? null : getChapterLabel(endNext)}
            onBack={() => {
              openChapter(null)
            }}
            onLoad={markLoaded}
            onNext={() => {
              openChapter(endNext)
            }}
            onPageVisible={showPage}
            pageElements={pageElements}
            pageGap={settings.pageGap}
            pageWidth={settings.pageWidth}
            preload={settings.preload}
            segments={stripSegments}
            stage={stage}
          />
        ) : (
          <PagedView
            onLoad={(index, aspect) => {
              markLoaded(chapter.id, index, aspect)
            }}
            settings={settings}
            urls={urls}
            visible={navigation.visible}
          />
        )}
      </ReaderStage>
      {segments.map((segment) => {
        const active = segment.id === chapter.id
        const page = active ? navigation.page : (positions.get(segment.id) ?? 0)

        return (
          <ReaderHistoryTracker
            chapterId={segment.id}
            completed={active ? last === pageCount - 1 : page === segment.pages.length - 1}
            enabled={
              signedIn && segment.status === "PUBLISHED" && (active || positions.has(segment.id))
            }
            key={segment.id}
            mediaId={segment.mediaId}
            pageId={segment.pages[page]?.id ?? null}
          />
        )
      })}
      <ReaderToolbar
        autoScrolling={autoScrolling}
        bookmarked={signedIn && currentPageId !== undefined ? bookmarks.bookmarked : null}
        chapterLabel={current.title === null ? currentLabel : `${currentLabel} – ${current.title}`}
        mediaId={chapter.mediaId}
        mediaTitle={mediaTitle}
        onAutoScroll={() => {
          setAutoScrolling((value) => !value)
        }}
        onMenu={() => {
          onSheetOpenChange(true)
        }}
        onReport={
          signedIn && currentPageId !== undefined
            ? () => {
                setAutoScrolling(false)
                setReporting({
                  chapterId: chapter.id,
                  pageId: currentPageId,
                  page: navigation.page + 1,
                  chapterLabel: currentLabel,
                })
              }
            : null
        }
        onToggleBookmark={bookmarks.toggle}
        strip={strip}
        visible={!idle}
      />
      <ReaderProgress
        direction={strip ? "ltr" : settings.direction}
        loaded={loaded}
        onSeek={navigation.goTo}
        pageCount={pageCount}
        style={settings.progressStyle}
        visible={navigation.visible}
      />
      <ReaderSheet
        chapter={{
          mediaId: chapter.mediaId,
          mediaTitle,
          current,
          choices,
          versions,
          prev,
          next,
          page: navigation.page,
          pageCount,
          onSelectChapter: (target) => {
            openChapter(
              target,
              target.number === current.number
                ? Math.min(navigation.page + 1, target.pageCount)
                : undefined,
            )
          },
          onSelectPage: navigation.goTo,
        }}
        bookmarks={
          signedIn
            ? {
                bookmarks: bookmarks.bookmarks,
                chapterId: chapter.id,
                onOpen: (bookmark) => {
                  onSheetOpenChange(false)

                  if (bookmark.chapterId === chapter.id) {
                    navigation.goTo(bookmark.page - 1)
                  } else {
                    openChapter(
                      data.chapters.find((row) => row.id === bookmark.chapterId) ?? null,
                      bookmark.page,
                    )
                  }
                },
                onRemove: bookmarks.remove,
              }
            : null
        }
        controls={controls}
        offline={{
          id: chapter.id,
          mediaId: chapter.mediaId,
          mediaTitle,
          label: current.title === null ? currentLabel : `${currentLabel} – ${current.title}`,
          pageUrls: urls,
        }}
        onOpenChange={onSheetOpenChange}
        open={sheetOpen}
        signedIn={signedIn}
      />
      <ReportPageDialog
        onClose={() => {
          setReporting(null)
        }}
        target={reporting}
      />
      <ChapterBoundaryDialog
        boundary={boundary}
        mediaTitle={mediaTitle}
        onClose={() => {
          setBoundaryOpen(false)
        }}
        onConfirm={(dontAskAgain) => {
          if (dontAskAgain) {
            update(
              settings.confirmChapterChange
                ? { confirmChapterChange: false }
                : { warnChapterGap: false },
            )
          }

          setBoundaryOpen(false)

          if (boundary !== null) {
            openChapter(
              boundary.chapter,
              boundary.step === "prev" ? boundary.chapter?.pageCount : undefined,
            )
          }
        }}
        open={boundaryOpen}
      />
    </>
  )
}
