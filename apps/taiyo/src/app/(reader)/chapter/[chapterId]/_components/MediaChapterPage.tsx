"use client"

import type { KeyboardEventHandler, MouseEvent } from "react"
import { useCallback } from "react"
import { tv } from "tailwind-variants"
import { MediaChapterPageOverlay } from "~/app/(reader)/_components/MediaChapterPageOverlay"
import { ReaderSettingsMediaChapterDropdown } from "~/app/(reader)/_components/readerSidebar/ui/ReaderSettingsMediaChapterDropdown"
import { useChapterNavigation } from "~/hooks/useChapterNavigation"
import { useDevice } from "~/hooks/useDevice"
import { useReaderSettingsStore } from "~/stores"
import { MediaChapterImages } from "./MediaChapterImages"

const mediaChapterPage = tv({
  base: "grid-in-chapter min-w-0 outline-none relative flex flex-col h-fit min-h-[calc(100dvh-var(--navbar-height))] data-[navbar-mode=hover]:min-h-dvh",
  variants: {
    width: {
      fit: "",
      full: "overflow-x-auto scrollbar-thin scrollbar-track-content1 scrollbar-thumb-primary",
    },
  },
})

export const MediaChapterPage = () => {
  const device = useDevice()
  const {
    navbarMode,
    page: { mode, overlay, width },
    update,
  } = useReaderSettingsStore()
  const { goBack, goForward } = useChapterNavigation()

  const base = mediaChapterPage({ width })

  const handleKeyPress: KeyboardEventHandler = (e) => {
    if (mode === "longstrip") {
      return
    }

    if (e.key === "ArrowLeft") {
      return goBack()
    }

    if (e.key === "ArrowRight") {
      return goForward()
    }
  }

  const handleContainerClick = useCallback(
    (side: "left" | "right") => (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault()

      const clickX = e.clientX
      const windowWidth = window.innerWidth
      const screenSide = clickX < windowWidth / 2 ? "left" : "right"

      // If it's on longstrip mode, on mobile
      if (mode === "longstrip" && !device?.isAboveTablet) {
        update("page.overlay", overlay === "show" ? "hide" : "show")
        return
      }

      if (mode === "longstrip") {
        return
      }

      if (screenSide === "left" || side === "right") {
        return goBack()
      }

      goForward()
    },
    [goBack, goForward, device?.isAboveTablet, mode, overlay, update],
  )

  return (
    <div
      className={base}
      onClick={handleContainerClick("left")}
      onContextMenu={handleContainerClick("right")}
      onKeyDown={handleKeyPress}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: needed in order to fire the onKeyDown event
      tabIndex={0}
      data-navbar-mode={navbarMode}
    >
      <MediaChapterPageOverlay />
      <MediaChapterImages />
      {mode === "longstrip" && (
        <div className="p-bodyPadding flex justify-center">
          <ReaderSettingsMediaChapterDropdown />
        </div>
      )}
    </div>
  )
}
