import type { InferResponseType } from "hono/client"
import { queryOptions } from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export type QuickSearchResults = InferResponseType<typeof api.search.$get, 200>["data"]

export const quickSearchQueryOptions = (q: string, contentRatings: readonly ContentRating[]) =>
  queryOptions({
    queryKey: ["search", "quick", { q, contentRatings }],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.search.$get(
          { query: { q, contentRating: contentRatings.join(",") } },
          { init: { signal } },
        ),
      ),
    staleTime: 30_000,
  })
