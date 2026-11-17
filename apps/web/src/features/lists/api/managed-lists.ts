import type { InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { api } from "@/lib/api"
import { unwrapEnvelope } from "@/lib/envelope"

export type ManagedListsFilter = {
  search?: string | undefined
  page: number
}

export type ManagedList = InferResponseType<typeof api.lists.managed.$get, 200>["data"][number]

export const managedListsQueryOptions = (filter: ManagedListsFilter) =>
  queryOptions({
    queryKey: ["lists", "manage", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.lists.managed.$get(
          {
            query: {
              page: String(filter.page),
              perPage: String(CATALOG_PER_PAGE),
              ...(filter.search === undefined ? {} : { search: filter.search }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })
