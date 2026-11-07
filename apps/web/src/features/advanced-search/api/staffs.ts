import type { InferResponseType } from "hono/client"
import { queryOptions } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export type StaffOption = InferResponseType<typeof api.staffs.$get, 200>["data"][number]

export const staffSearchQueryOptions = (search: string) =>
  queryOptions({
    queryKey: ["staffs", "search", search],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.staffs.$get(
          { query: { search, page: "1", perPage: "12" } },
          { init: { signal } },
        ),
      ),
    staleTime: 5 * 60_000,
  })

export const staffQueryOptions = (staffId: string) =>
  queryOptions({
    queryKey: ["staffs", staffId],
    queryFn: async ({ signal }): Promise<StaffOption> => {
      const { id, name, imageUrl } = await unwrap(
        await api.staffs[":id"].$get({ param: { id: staffId } }, { init: { signal } }),
      )

      return { id, name, imageUrl }
    },
    staleTime: 10 * 60_000,
  })
