import { useSuspenseQuery } from "@tanstack/react-query"
import { useDeferredValue, useMemo } from "react"
import { useAdvancedSearch } from "@/features/advanced-search/hooks/use-advanced-search"
import {
  SEARCH_MAX_RESULTS,
  SEARCH_PER_PAGE,
  toSearchBody,
} from "@/features/advanced-search/lib/advanced-search"
import { searchMediasQueryOptions } from "@/features/media/api/medias"
import { useSettings } from "@/lib/settings"

export function useSearchResults() {
  const { search } = useAdvancedSearch()
  const { contentRatings } = useSettings()
  const body = useMemo(() => toSearchBody(search, contentRatings), [search, contentRatings])
  const deferredBody = useDeferredValue(body)
  const { data } = useSuspenseQuery(searchMediasQueryOptions(deferredBody))
  const reachable = Math.min(data.meta.total, SEARCH_MAX_RESULTS)

  return {
    hits: data.data,
    total: data.meta.total,
    page: deferredBody.page,
    pageCount: Math.ceil(reachable / SEARCH_PER_PAGE),
    isStale: body !== deferredBody,
  }
}

export type SearchHit = ReturnType<typeof useSearchResults>["hits"][number]
