import { DEFAULT_SCANS_LIST_PER_PAGE } from "@taiyomoe/constants"
import { useAtom, useAtomValue } from "jotai"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"
import { useCallback } from "react"
import { useDebounceCallback } from "usehooks-ts"
import {
  scansListInitialItemsAtom,
  scansListLoadingAtom,
} from "~/atoms/scansList.atoms"
import { api } from "~/trpc/react"

export const useScansList = () => {
  const initialItems = useAtomValue(scansListInitialItemsAtom)
  const [isInternallyLoading, setIsInternallyLoading] =
    useAtom(scansListLoadingAtom)
  const [query, setQuery] = useQueryState("q", parseAsString.withDefault(""))
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(DEFAULT_SCANS_LIST_PER_PAGE),
  )
  const { data: items, refetch } = api.scans.getList.useQuery(
    { search: query, page, perPage },
    { initialData: initialItems, refetchOnMount: false, enabled: false },
  )

  const handleSearch = useDebounceCallback(
    useCallback(async () => {
      await refetch()
      setIsInternallyLoading(false)
    }, [refetch, setIsInternallyLoading]),
    300,
  )

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value)
      setPage(1)
      setIsInternallyLoading(true)
      handleSearch()
    },
    [setQuery, setPage, setIsInternallyLoading, handleSearch],
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
    setQuery,
    setPage,
    setPerPage,
    handleQueryChange,
    handleClear,
  }
}
