import { DEFAULT_SCANS_LIST_PER_PAGE } from "@taiyomoe/constants"
import type { ScansList } from "@taiyomoe/types"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"
import { useCallback, useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { api } from "~/trpc/react"

export const useScansList = (initialitem: ScansList) => {
  const [query, setQuery] = useQueryState("q", parseAsString.withDefault(""))
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(DEFAULT_SCANS_LIST_PER_PAGE),
  )
  const {
    data: items,
    isPlaceholderData,
    refetch,
  } = api.scans.getList.useQuery(
    { search: query, page, perPage },
    { initialData: initialitem, refetchOnMount: false, enabled: false },
  )
  const [isInternallyLoading, setIsInternallyLoading] = useState(false)

  const handleSearch = useDebounceCallback(
    useCallback(async () => {
      await refetch()
      setIsInternallyLoading(false)
    }, [refetch]),
    200,
  )

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value)
      setPage(1)
      setIsInternallyLoading(true)
      handleSearch()
    },
    [setQuery, setPage, handleSearch],
  )

  const handleClear = useCallback(() => {
    setQuery("")
    setPage(1)
  }, [setQuery, setPage])

  return {
    query,
    page,
    perPage,
    items: isInternallyLoading ? [] : items,
    isLoading: isInternallyLoading,
    isPlaceholderData,
    setQuery,
    setPage,
    setPerPage,
    handleQueryChange,
    handleClear,
  }
}
