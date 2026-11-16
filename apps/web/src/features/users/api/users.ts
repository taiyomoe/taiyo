import type { CosmeticKind } from "@taiyomoe/db/cosmetics"
import type { Role } from "@taiyomoe/permissions"
import type { InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { BulkResult } from "@/features/catalog/api/catalog"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"

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

const useUserBulkMutation = <TInput>(run: (input: TInput) => Promise<BulkResult>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: run,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
}

export const useSetUsersRole = () =>
  useUserBulkMutation(async (json: { userIds: string[]; role: Role }) =>
    unwrap(await api.users.role.$patch({ json })),
  )

export const useGiveUsersPoints = () =>
  useUserBulkMutation(async (json: { userIds: string[]; amount: number }) =>
    unwrap(await api.users.points.$post({ json })),
  )

export const useGiveUsersCosmetic = () =>
  useUserBulkMutation(
    async (json: { userIds: string[]; kind: CosmeticKind; key: string; equip: boolean }) =>
      unwrap(await api.users.cosmetics.$post({ json })),
  )

export const useUnbanUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) =>
      ensureSuccess(await api.users[":id"].unban.$post({ param: { id: userId } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
}
