"use client"

import {
  parseAsInteger,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate"
import { useCallback } from "react"

import type { MediaTabs } from "@taiyomoe/types"
import { DEFAULT_MEDIA_PAGE, DEFAULT_MEDIA_PER_PAGE } from "~/lib/constants"

export const useMediaNavigation = () => {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringEnum<MediaTabs>(["info", "chapters"]).withDefault("chapters"),
  )
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(DEFAULT_MEDIA_PAGE),
  )
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(DEFAULT_MEDIA_PER_PAGE),
  )

  const handlePerPageChange = useCallback(
    async (newPerPage: number) => {
      await setPage(DEFAULT_MEDIA_PAGE)
      await setPerPage(newPerPage)
    },
    [setPage, setPerPage],
  )

  return { tab, setTab, page, setPage, perPage, handlePerPageChange }
}
