import { DEFAULT_CHAPTERS_LIST_PER_PAGE } from "@taiyomoe/constants"
import { useAtom, useAtomValue } from "jotai"
import { parseAsString, useQueryState } from "nuqs"
import { useCallback } from "react"
import { type RuleGroupType, formatQuery } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import {
  chaptersListInitialDataAtom,
  chaptersListLoadingAtom,
} from "~/atoms/chaptersList.atoms"
import { api } from "~/trpc/react"
import { pageParser, perPageParser } from "~/utils/nuqsParsers"

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
    {
      page,
      perPage,
    },
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
    setQuery(formatQuery(newQuery, { format: "jsonata", parseNumbers: true }))
    setPage(null)
    setIsInternallyLoading(true)
    handleSearch()

    console.log(
      "formatted",
      formatQuery(newQuery, { format: "jsonata", parseNumbers: true }),
    )
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
