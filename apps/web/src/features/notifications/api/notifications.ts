import type { InferResponseType } from "hono/client"
import { type QueryClient, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"

export type Notification = InferResponseType<
  typeof api.users.me.notifications.$get,
  200
>["data"][number]

type NotificationPage = InferResponseType<typeof api.users.me.notifications.$get, 200>

export const notificationKeys = {
  all: ["notifications"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
  list: ["notifications", "list"] as const,
}

export const unreadNotificationCountQueryOptions = () =>
  queryOptions({
    queryKey: notificationKeys.unreadCount,
    queryFn: async ({ signal }) =>
      unwrap(await api.users.me.notifications["unread-count"].$get({}, { init: { signal } })),
    select: (data) => data.count,
    refetchInterval: 5 * 60_000,
  })

export const notificationsQueryOptions = (page: number, perPage: number) =>
  queryOptions({
    queryKey: [...notificationKeys.list, { page, perPage }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users.me.notifications.$get(
          { query: { page: String(page), perPage: String(perPage) } },
          { init: { signal } },
        ),
      ),
  })

const markRead = (queryClient: QueryClient, ids: ReadonlySet<string> | "all") => {
  const readAt = new Date().toISOString()

  queryClient.setQueriesData<NotificationPage>({ queryKey: notificationKeys.list }, (page) =>
    page === undefined
      ? page
      : {
          ...page,
          data: page.data.map((notification) =>
            notification.readAt === null && (ids === "all" || ids.has(notification.id))
              ? { ...notification, readAt }
              : notification,
          ),
        },
  )
  queryClient.setQueryData<{ count: number }>(notificationKeys.unreadCount, (data) =>
    data === undefined ? data : { count: ids === "all" ? 0 : Math.max(data.count - ids.size, 0) },
  )
}
const useNotificationMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  ids: (variables: TVariables) => ReadonlySet<string> | "all",
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      markRead(queryClient, ids(variables))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export const useMarkNotificationRead = () =>
  useNotificationMutation(
    async (id: string) =>
      ensureSuccess(await api.users.me.notifications[":id"].read.$post({ param: { id } })),
    (id) => new Set([id]),
  )

export const useMarkAllNotificationsRead = () =>
  useNotificationMutation(
    async () => ensureSuccess(await api.users.me.notifications["read-all"].$post()),
    () => "all",
  )

export const getNotificationStreamUrl = () => api.users.me.notifications.stream.$url().toString()
