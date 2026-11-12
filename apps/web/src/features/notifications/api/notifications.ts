import type { InferResponseType } from "hono/client"
import {
  type QueryClient,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useVoteComment } from "@/features/comments/api/comments"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"

export type Notification = InferResponseType<
  typeof api.users.me.notifications.$get,
  200
>["data"][number]

export type NotificationCounts = InferResponseType<
  typeof api.users.me.notifications.counts.$get,
  200
>["data"]

export type NotificationCategory = keyof NotificationCounts["categories"]

export type NotificationFilters = {
  category?: NotificationCategory | undefined
  unread?: boolean | undefined
  q?: string | undefined
}

type NotificationPage = InferResponseType<typeof api.users.me.notifications.$get, 200>

export const NOTIFICATION_CATEGORIES = ["chapters", "replies", "activity"] as const

const CATEGORY_OF_TYPE = {
  CHAPTER_PUBLISHED: "chapters",
  COMMENT_REPLY: "replies",
  COMMENT_LIKE: "activity",
  FOLLOW: "activity",
} as const satisfies Record<Notification["type"], NotificationCategory>

export const categoryOf = (notification: Notification) => CATEGORY_OF_TYPE[notification.type]

export const notificationKeys = {
  all: ["notifications"] as const,
  counts: ["notifications", "counts"] as const,
  list: ["notifications", "list"] as const,
}

export const notificationCountsQueryOptions = () =>
  queryOptions({
    queryKey: notificationKeys.counts,
    queryFn: async ({ signal }) =>
      unwrap(await api.users.me.notifications.counts.$get({}, { init: { signal } })),
    refetchInterval: 5 * 60_000,
  })

export const notificationsQueryOptions = ({
  page,
  perPage,
  category,
  unread = false,
  q = "",
}: { page: number; perPage: number } & NotificationFilters) =>
  queryOptions({
    queryKey: [...notificationKeys.list, { page, perPage, category, unread, q }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users.me.notifications.$get(
          {
            query: {
              page: String(page),
              perPage: String(perPage),
              ...(category === undefined ? {} : { category }),
              ...(unread ? { unread: "true" } : {}),
              ...(q === "" ? {} : { q }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

type Change = { ids: ReadonlySet<string> | "all"; readAt: string | null } | { deleted: string[] }

const cachedNotifications = (queryClient: QueryClient) =>
  new Map(
    queryClient
      .getQueriesData<NotificationPage>({ queryKey: notificationKeys.list })
      .flatMap(([, page]) => page?.data ?? [])
      .map((notification) => [notification.id, notification]),
  )
const unreadDeltaOf = (notification: Notification, change: Change) => {
  if ("deleted" in change) {
    return notification.readAt === null ? -1 : 0
  }

  return change.readAt === null ? 1 : -1
}
/** Applies a change to every cached list and to the counts, before the server confirms it. */
const applyChange = (queryClient: QueryClient, change: Change) => {
  const known = cachedNotifications(queryClient)
  const touches = (id: string) =>
    "deleted" in change ? change.deleted.includes(id) : change.ids === "all" || change.ids.has(id)
  const changed = [...known.values()].filter((notification) =>
    "deleted" in change
      ? touches(notification.id)
      : touches(notification.id) && (notification.readAt === null) !== (change.readAt === null),
  )

  queryClient.setQueriesData<NotificationPage>({ queryKey: notificationKeys.list }, (page) => {
    if (page === undefined) {
      return page
    }

    if ("deleted" in change) {
      const data = page.data.filter((notification) => !touches(notification.id))

      return {
        ...page,
        data,
        meta: { ...page.meta, total: page.meta.total - (page.data.length - data.length) },
      }
    }

    return {
      ...page,
      data: page.data.map((notification) =>
        touches(notification.id) ? { ...notification, readAt: change.readAt } : notification,
      ),
    }
  })
  queryClient.setQueryData<NotificationCounts>(notificationKeys.counts, (counts) => {
    if (counts === undefined) {
      return counts
    }

    if (!("deleted" in change) && change.ids === "all" && change.readAt !== null) {
      return { ...counts, unread: 0, categories: { chapters: 0, replies: 0, activity: 0 } }
    }

    const next = structuredClone(counts)

    for (const notification of changed) {
      const category = categoryOf(notification)
      const unreadDelta = unreadDeltaOf(notification, change)

      next.unread = Math.max(next.unread + unreadDelta, 0)
      next.categories[category] = Math.max(next.categories[category] + unreadDelta, 0)
      next.total -= "deleted" in change ? 1 : 0
    }

    return next
  })
}
const useNotificationMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  change: (variables: TVariables) => Change,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      applyChange(queryClient, change(variables))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export const useMarkNotificationRead = () =>
  useNotificationMutation(
    async (id: string) =>
      ensureSuccess(await api.users.me.notifications[":id"].read.$post({ param: { id } })),
    (id) => ({ ids: new Set([id]), readAt: new Date().toISOString() }),
  )

export const useMarkAllNotificationsRead = () =>
  useNotificationMutation(
    async () => ensureSuccess(await api.users.me.notifications["read-all"].$post()),
    () => ({ ids: "all", readAt: new Date().toISOString() }),
  )

export const useSetNotificationsRead = () =>
  useNotificationMutation(
    async ({ ids, read }: { ids: string[]; read: boolean }) =>
      ensureSuccess(await api.users.me.notifications.$patch({ json: { ids, read } })),
    ({ ids, read }) => ({ ids: new Set(ids), readAt: read ? new Date().toISOString() : null }),
  )

export const useDeleteNotifications = () =>
  useNotificationMutation(
    async (ids: string[]) =>
      ensureSuccess(await api.users.me.notifications.$delete({ json: { ids } })),
    (ids) => ({ deleted: ids }),
  )

/** Upvotes or un-upvotes the reply behind a notification, mirrored in the notification lists. */
export const useUpvoteFromNotification = () => {
  const queryClient = useQueryClient()
  const vote = useVoteComment()
  const mirror = (commentId: string, voted: boolean) => {
    queryClient.setQueriesData<NotificationPage>({ queryKey: notificationKeys.list }, (page) =>
      page === undefined
        ? page
        : {
            ...page,
            data: page.data.map((notification) =>
              notification.type === "COMMENT_REPLY" && notification.comment.id === commentId
                ? { ...notification, comment: { ...notification.comment, viewerVoted: voted } }
                : notification,
            ),
          },
    )
  }

  return (commentId: string, voted: boolean) => {
    mirror(commentId, voted)
    vote.mutate(
      { id: commentId, voted },
      {
        onError: () => {
          mirror(commentId, !voted)
        },
      },
    )
  }
}

export const getNotificationStreamUrl = () => api.users.me.notifications.stream.$url().toString()
