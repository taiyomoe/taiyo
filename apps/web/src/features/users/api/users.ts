import type { Role } from "@taiyomoe/permissions"
import type { InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ensureSuccess, unwrapEnvelope } from "@/lib/envelope"

export const USERS_PER_PAGE = 20

export type UsersFilter = {
  search?: string | undefined
  role?: Role | undefined
  banned?: boolean | undefined
  page: number
}

export type ManagedUser = InferResponseType<typeof api.users.$get, 200>["data"][number]

export const usersQueryOptions = (filter: UsersFilter) =>
  queryOptions({
    queryKey: ["users", "list", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users.$get(
          {
            query: {
              page: String(filter.page),
              perPage: String(USERS_PER_PAGE),
              ...(filter.search === undefined ? {} : { search: filter.search }),
              ...(filter.role === undefined ? {} : { role: filter.role }),
              ...(filter.banned === true ? { banned: "true" } : {}),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const useSetUserRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) =>
      ensureSuccess(await api.users[":id"].role.$patch({ param: { id: userId }, json: { role } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
}

export const useUnbanUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) =>
      ensureSuccess(await api.users[":id"].unban.$post({ param: { id: userId } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
}
