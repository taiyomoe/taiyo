import {
  DEFAULT_GROUPED_CHAPTERS_PER_PAGE,
  DEFAULT_USER_FOLLOWS_PER_PAGE,
} from "@taiyomoe/constants"
import type { UserTabs } from "@taiyomoe/types"
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs"
import { type Key, useEffect } from "react"

export const useUserNavigation = () => {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringEnum<UserTabs>([
      "info",
      "uploads",
      "following",
      "followers",
    ]).withDefault("info"),
  )
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(
      tab === "uploads"
        ? DEFAULT_GROUPED_CHAPTERS_PER_PAGE
        : DEFAULT_USER_FOLLOWS_PER_PAGE,
    ),
  )

  const handleTabChange = (newTab: Key) => {
    setTab(newTab as UserTabs)
    setPage(null)
    setPerPage(null)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: when the user changes perPage, we want to reset the page to 1
  useEffect(() => {
    setPage(null)
  }, [perPage])

  return {
    tab,
    page,
    perPage,
    handleTabChange,
    setPage,
    setPerPage,
  }
}
