"use client"

import { DEFAULT_MEDIA_PAGE, DEFAULT_MEDIA_PER_PAGE } from "@taiyomoe/constants"
import type { MediaTabs } from "@taiyomoe/types"
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs"
import { useCallback } from "react"

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
