import { DEFAULT_CHAPTERS_LIST_PER_PAGE } from "@taiyomoe/constants"
import { useAtom, useAtomValue } from "jotai"
import { parseAsString, useQueryState } from "nuqs"
import { useCallback } from "react"
import type { RuleGroupType } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import {
  chaptersListInitialDataAtom,
  chaptersListLoadingAtom,
} from "~/atoms/chaptersList.atoms"
import { api } from "~/trpc/react"
import { pageParser, perPageParser } from "~/utils/nuqsParsers"
import { RQBUtils } from "~/utils/rqb.utils"

export const useChaptersList = () => {
  const initialItems = useAtomValue(chaptersListInitialDataAtom)
  const [isInternallyLoading, setIsInternallyLoading] = useAtom(
    chaptersListLoadingAtom,
  )

  const [query, setQuery] = useQueryState("q", parseAsString.withDefault(""))
  const [page, setPage] = useQueryState("page", pageParser)
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    perPageParser(DEFAULT_CHAPTERS_LIST_PER_PAGE),
  )

  const {
    data: { chapters: items, totalPages },
    refetch,
  } = api.chapters.getList.useQuery(
    { query, page, perPage },
    { initialData: initialItems, refetchOnMount: false, enabled: false },
  )

  const handleSearch = useDebounceCallback(
    useCallback(async () => {
      await refetch()
      setIsInternallyLoading(false)
    }, [refetch, setIsInternallyLoading]),
    300,
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      setIsInternallyLoading(true)
      handleSearch()
    },
    [setPage, setIsInternallyLoading, handleSearch],
  )

  const handlePerPageChange = useCallback(
    (newPerPage: number) => {
      setPerPage(newPerPage)
      setPage(null)
      setIsInternallyLoading(true)
      handleSearch()
    },
    [setPerPage, setPage, setIsInternallyLoading, handleSearch],
  )

  const handleQueryChange = (newQuery: RuleGroupType) => {
    const formatted = RQBUtils.formatQuery(newQuery)

    if (formatted === null && query === "") {
      return
    }

    if (query !== formatted) {
      setQuery(formatted)
      setPage(null)
      setIsInternallyLoading(true)
      handleSearch()
    }
  }

  return {
    page,
    perPage,
    totalPages,
    items,
    isLoading: isInternallyLoading,
    handlePageChange,
    handlePerPageChange,
    handleQueryChange,
  }
}
