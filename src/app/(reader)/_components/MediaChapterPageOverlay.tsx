import { tv } from "@nextui-org/react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { useDevice } from "~/hooks/useDevice"
import { cn } from "~/lib/utils/cn"
import { MediaUtils } from "~/lib/utils/media.utils"
import { useReaderSettingsStore, useReaderStore } from "~/stores"

import { MediaChapterPageOverlayScrollButton } from "./MediaChapterPageOverlayScrollButton"
import { ReaderSettingsMediaChapterDropdown } from "./readerSidebar/ui/ReaderSettingsMediaChapterDropdown"
import { ReaderSidebarOpenButton } from "./readerSidebar/ui/ReaderSidebarOpenButton"

const mediaChapterPageOverlay = tv({
  slots: {
    container:
      "fixed z-10 w-full px-bodyPadding bg-black bg-opacity-60 transition-all invisible data-[show=true]:visible",
    topContainer:
      "top-0 -mt-[100px] h-[100px] space-y-4 py-2 data-[show=true]:mt-0",
    bottomContainer:
      "bottom-0 -mb-[100px] flex justify-end gap-4 py-3 data-[show=true]:mb-0",
    title:
      "line-clamp-1 text-center text-2xl font-semibold drop-shadow-accent hover:underline",
  },
  variants: {
    navbarMode: {
      fixed: {},
      sticky: {
        topContainer: "top-navbar data-[show=true]:visible",
      },
      hover: {},
    },
  },
})

export const MediaChapterPageOverlay = () => {
  const { page, navbarMode } = useReaderSettingsStore()
  const { chapter } = useReaderStore()
  const device = useDevice()
  const [topContainerTop, setTopContainerTop] = useState<number | undefined>(
    navbarMode === "fixed" ? 60 : undefined,
  )

  const slots = mediaChapterPageOverlay({ navbarMode })

  const computeTopContainerTop = useCallback(
    (yPosition: number) => {
      if (yPosition <= 60) {
        setTopContainerTop(60 - yPosition)
      } else if (topContainerTop !== undefined) {
        setTopContainerTop(undefined)
      }
    },
    [topContainerTop],
  )

  useEffect(() => {
    const handleScroll = () => {
      if (navbarMode !== "fixed") {
        return
      }

      const scrollY = window.scrollY
      computeTopContainerTop(scrollY)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: when the navbar mode changes, we want to recompute the top container top
  useEffect(() => {
    computeTopContainerTop(window.scrollY)
  }, [computeTopContainerTop, navbarMode])

  if (page.mode === "single" || device?.isAboveTablet || !chapter) {
    return null
  }

  return (
    <>
      <div
        className={cn(slots.container(), slots.topContainer())}
        data-show={page.overlay === "show"}
        style={{ top: topContainerTop }}
      >
        <Link href={MediaUtils.getUrl(chapter.media)} className={slots.title()}>
          {chapter.media.title}
        </Link>
        <ReaderSettingsMediaChapterDropdown />
      </div>
      <div
        className={cn(slots.container(), slots.bottomContainer())}
        data-show={page.overlay === "show"}
      >
        <MediaChapterPageOverlayScrollButton />
        <ReaderSidebarOpenButton />
      </div>
    </>
  )
}
