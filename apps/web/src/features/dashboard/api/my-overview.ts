import type { InferResponseType } from "hono/client"
import { queryOptions } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export const myOverviewQueryOptions = queryOptions({
  queryKey: ["users", "me", "overview"],
  queryFn: async ({ signal }) => unwrap(await api.users.me.overview.$get({}, { init: { signal } })),
})

export type MyOverview = InferResponseType<typeof api.users.me.overview.$get, 200>["data"]
