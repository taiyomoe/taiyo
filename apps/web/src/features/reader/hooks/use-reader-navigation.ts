import type { ReaderSettings } from "@taiyomoe/schemas/reader-settings"
import { type RefObject, useLayoutEffect, useMemo, useState } from "react"
import type { ReaderStep } from "@/features/reader/lib/reader-input"
import { buildSpreads, findSpreadIndex } from "@/features/reader/lib/reader-spreads"

const WIDE_ASPECT = 1.1

export function useReaderNavigation({
  chapterId,
  pageCount,
  initialPage,
  settings,
  stage,
  getPageElement,
  onBoundary,
}: {
  chapterId: string
  pageCount: number
  initialPage: number
  settings: Pick<ReaderSettings, "mode" | "firstPageAlone" | "direction">
  stage: RefObject<HTMLElement | null>
  getPageElement: (index: number) => HTMLElement | undefined
  onBoundary: (step: ReaderStep) => void
}) {
  const [page, setPage] = useState(initialPage)
  const [widePages, setWidePages] = useState<{ chapterId: string; pages: ReadonlySet<number> }>(
    () => ({ chapterId, pages: new Set() }),
  )
  const strip = settings.mode === "strip"
  const chapterWidePages = widePages.chapterId === chapterId ? widePages.pages : null
  const spreads = useMemo(
    () =>
      buildSpreads(pageCount, {
        double: settings.mode === "double",
        firstPageAlone: settings.firstPageAlone,
        widePages: chapterWidePages ?? new Set(),
      }),
    [pageCount, settings.mode, settings.firstPageAlone, chapterWidePages],
  )
  const spreadIndex = findSpreadIndex(spreads, page)
  const visible = strip ? [page] : (spreads[spreadIndex] ?? [page])
  const firstVisible = visible[0] ?? page

  useLayoutEffect(() => {
    const element = stage.current

    if (!strip && element !== null) {
      element.scrollTo({
        top: 0,
        left: settings.direction === "rtl" ? element.scrollWidth : 0,
      })
    }
  }, [firstVisible, settings.direction, stage, strip])

  return {
    page,
    visible,
    setPageFromScroll: setPage,
    goTo: (index: number) => {
      const target = Math.min(Math.max(index, 0), pageCount - 1)

      setPage(target)

      if (strip) {
        getPageElement(target)?.scrollIntoView({ block: "start" })
      }
    },
    step: (direction: ReaderStep) => {
      const element = stage.current

      if (strip) {
        if (element === null) {
          return
        }

        const atEdge =
          direction === "next"
            ? element.scrollTop + element.clientHeight >= element.scrollHeight - 2
            : element.scrollTop <= 0

        if (atEdge) {
          onBoundary(direction)
        } else {
          element.scrollBy({
            top: (direction === "next" ? 1 : -1) * element.clientHeight * 0.85,
            behavior: "smooth",
          })
        }

        return
      }

      const target = spreads[spreadIndex + (direction === "next" ? 1 : -1)]

      if (target === undefined) {
        onBoundary(direction)
      } else {
        setPage(target[0] ?? page)
      }
    },
    markLoaded: (index: number, aspect: number) => {
      if (aspect > WIDE_ASPECT && chapterWidePages?.has(index) !== true) {
        setWidePages((previous) => ({
          chapterId,
          pages: new Set(previous.chapterId === chapterId ? previous.pages : []).add(index),
        }))
      }
    },
  }
}
