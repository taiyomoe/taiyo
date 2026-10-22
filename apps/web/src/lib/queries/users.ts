import type { Role } from "@taiyomoe/permissions"
import type { InferResponseType } from "hono/client"
import { queryOptions } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export const USERS_PER_PAGE = 25

export type UsersFilter = {
  search?: string | undefined
  role?: Role | undefined
  banned?: boolean | undefined
  page: number
}

export type ManagedUser = InferResponseType<typeof api.users.$get, 200>["data"][number]

export const myOverviewQueryOptions = queryOptions({
  queryKey: ["users", "me", "overview"],
  queryFn: async ({ signal }) => unwrap(await api.users.me.overview.$get({}, { init: { signal } })),
})
