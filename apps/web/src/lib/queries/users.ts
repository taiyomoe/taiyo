import type { Role } from "@taiyomoe/permissions"
import type { InferResponseType } from "hono/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"

export const USERS_PER_PAGE = 25

export type UsersFilter = {
  search?: string | undefined
  role?: Role | undefined
  banned?: boolean | undefined
  page: number
}

export const usersQueryOptions = ({ search, role, banned, page }: UsersFilter) =>
  queryOptions({
    queryKey: ["users", "list", { search, role, banned, page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users.$get(
          {
            query: {
              page: String(page),
              perPage: String(USERS_PER_PAGE),
              ...(search === undefined ? {} : { search }),
              ...(role === undefined ? {} : { role }),
              ...(banned === undefined ? {} : { banned: banned ? "true" : "false" }),
            },
          },
          { init: { signal } },
        ),
      ),
  })

export type ManagedUser = InferResponseType<typeof api.users.$get, 200>["data"][number]

export const myOverviewQueryOptions = queryOptions({
  queryKey: ["users", "me", "overview"],
  queryFn: async ({ signal }) => unwrap(await api.users.me.overview.$get({}, { init: { signal } })),
})

const useInvalidateUsers = () => {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries({ queryKey: ["users"] })
}

export function useSetUserRole() {
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) =>
      ensureSuccess(await api.users[":id"].role.$patch({ param: { id: userId }, json: { role } })),
    onSuccess: invalidate,
  })
}

export function useBanUser() {
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
      days,
    }: {
      userId: string
      reason: string
      days: number | null
    }) =>
      ensureSuccess(
        await api.users[":id"].ban.$post({ param: { id: userId }, json: { reason, days } }),
      ),
    onSuccess: invalidate,
  })
}

export function useUnbanUser() {
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: async (userId: string) =>
      ensureSuccess(await api.users[":id"].unban.$post({ param: { id: userId } })),
    onSuccess: invalidate,
  })
}
