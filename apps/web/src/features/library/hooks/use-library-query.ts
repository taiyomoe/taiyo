import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { libraryQueryOptions } from "@/features/library/api/library"
import { LIBRARY_PER_PAGE } from "@/features/library/lib/library-search"
import { useSettings } from "@/lib/settings"

const routeApi = getRouteApi("/library")

export function useLibraryQuery() {
  const search = routeApi.useSearch()
  const { contentRatings } = useSettings()
  const page = search.page ?? 1
  const query = useQuery(
    libraryQueryOptions({
      status: search.status,
      sort: search.sort ?? "read",
      q: search.q ?? "",
      page,
      perPage: LIBRARY_PER_PAGE,
      contentRatings,
    }),
  )

  return {
    search,
    page,
    query,
    pageCount: Math.ceil((query.data?.meta.total ?? 0) / LIBRARY_PER_PAGE),
  }
}
