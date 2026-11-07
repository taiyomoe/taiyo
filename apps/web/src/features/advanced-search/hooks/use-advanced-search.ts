import { getRouteApi } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"
import {
  type AdvancedSearch,
  EMPTY_FILTERS,
  parseAdvancedSearch,
  toUrlSearch,
} from "@/features/advanced-search/lib/advanced-search"

const routeApi = getRouteApi("/titles")

export function useAdvancedSearch() {
  const url = routeApi.useSearch()
  const search = useMemo(() => parseAdvancedSearch(url), [url])
  const navigate = routeApi.useNavigate()
  const update = useCallback(
    (patch: Partial<AdvancedSearch> | ((search: AdvancedSearch) => Partial<AdvancedSearch>)) =>
      navigate({
        search: (previous) => {
          const current = parseAdvancedSearch(previous)

          return toUrlSearch({
            ...current,
            page: 1,
            ...(typeof patch === "function" ? patch(current) : patch),
          })
        },
        replace: true,
        resetScroll: false,
      }),
    [navigate],
  )
  const reset = useCallback(
    () =>
      navigate({
        search: (previous) =>
          toUrlSearch({ ...parseAdvancedSearch(previous), ...EMPTY_FILTERS, page: 1 }),
        resetScroll: false,
      }),
    [navigate],
  )

  return { search, update, reset }
}
