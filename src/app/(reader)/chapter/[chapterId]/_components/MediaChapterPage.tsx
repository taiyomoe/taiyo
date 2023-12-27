"use client"

import type { KeyboardEventHandler, MouseEventHandler } from "react"
import { useCallback } from "react"
import { tv } from "tailwind-variants"

import { MediaChapterPageOverlay } from "~/app/(reader)/_components/MediaChapterPageOverlay"
import { useChapterNavigation } from "~/hooks/useChapterNavigation"
import { useDevice } from "~/hooks/useDevice"
import { useReaderSettingsStore } from "~/stores"

import { MediaChapterImages } from "./MediaChapterImages"

const mediaChapterPage = tv({
  slots: {
    container:
      "grid-in-chapter min-w-0 relative flex flex-col h-fit min-h-[calc(100dvh-var(--navbar-height))]",
    imagesWrapper: "overflow-x-auto flex items-center h-full m-auto",
  },
  variants: {
    width: {
      fit: {},
      full: {},
    },
  },
  compoundVariants: [
    {
      mode: "single",
      width: "full",
      className: {
        container:
          "overflow-x-auto scrollbar-thin scrollbar-track-content1 scrollbar-thumb-primary",
      },
    },
  ],
})

export const MediaChapterPage = () => {
  const { isAboveTablet } = useDevice()
  const {
    page: { mode, overlay, width },
    update,
  } = useReaderSettingsStore()
  const { goBack, goForward } = useChapterNavigation()

  const slots = mediaChapterPage({ width })

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

  const handleContainerClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const clickX = e.clientX
      const windowWidth = window.innerWidth
      const screenSide = clickX < windowWidth / 2 ? "left" : "right"

      // If it's on longstrip mode, on mobile
      if (mode === "longstrip" && !isAboveTablet) {
        update("page.overlay", overlay === "show" ? "hide" : "show")
        return
      }

      if (mode === "longstrip") {
        return
      }

      if (screenSide === "left") {
        return goBack()
      }

      goForward()
    },
    [goBack, goForward, isAboveTablet, mode, overlay, update],
  )

  return (
    <div
      className={slots.container()}
      onClick={handleContainerClick}
      onKeyDown={handleKeyPress}
    >
      <MediaChapterPageOverlay />
      <div className={slots.imagesWrapper()}>
        <MediaChapterImages />
      </div>
    </div>
  )
}
