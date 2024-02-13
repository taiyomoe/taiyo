"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { useWindowSize } from "usehooks-ts"

import { useDevice } from "~/hooks/useDevice"
import type { MediaChapterLimited } from "~/lib/types"
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils"
import { useReaderSettingsStore, useReaderStore } from "~/stores"

type Props = {
  mediaChapter: MediaChapterLimited
}

export const PopulateAtoms = ({ mediaChapter }: Props) => {
  const readerSettings = useReaderSettingsStore()
  const { load } = useReaderStore()
  const device = useDevice()
  const pathname = usePathname()
  const loaded = useRef(false)

  const { currentPageNumber } = MediaChapterUtils.parseUrl(pathname)

  useEffect(() => {
    if (!loaded.current) {
      load(mediaChapter, currentPageNumber)
      loaded.current = true
    }
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this effect when the viewport changes
  useEffect(() => {
    if (!device || device.isAboveTablet) return

    if (readerSettings.sidebar.openMode === "hover") {
      readerSettings.update("sidebar.openMode", "button")
    }

    if (readerSettings.navbarMode === "hover") {
      readerSettings.update("navbarMode", "sticky")
    }
  }, [device?.isAboveTablet])

  return null
}
