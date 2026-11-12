import type { InferRequestType, InferResponseType } from "hono/client"
import { type QueryClient, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export const TOP_LISTS_PER_PAGE = 20

export const USER_LISTS_PER_PAGE = 24

const MY_LISTS_LIMIT = 100

export type ListSummary = InferResponseType<typeof api.lists.$get, 200>["data"][number]

export type ListDetail = InferResponseType<(typeof api.lists)[":id"]["$get"], 200>["data"]

export type MyList = InferResponseType<typeof api.users.me.lists.$get, 200>["data"][number]

type CreateListInput = InferRequestType<typeof api.users.me.lists.$post>["json"]

type UpdateListInput = InferRequestType<(typeof api.lists)[":id"]["$patch"]>["json"]

export const topListsQueryOptions = (page: number, contentRatings: readonly ContentRating[]) =>
  queryOptions({
    queryKey: ["lists", "top", { page, contentRatings }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.lists.$get(
          {
            query: {
              page: String(page),
              perPage: String(TOP_LISTS_PER_PAGE),
              contentRating: contentRatings.join(","),
            },
          },
          { init: { signal } },
        ),
      ),
  })

export const myListsQueryOptions = (contentRatings: readonly ContentRating[], mediaId?: string) =>
  queryOptions({
    queryKey: ["lists", "mine", { contentRatings, mediaId }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users.me.lists.$get(
          {
            query: {
              perPage: String(MY_LISTS_LIMIT),
              contentRating: contentRatings.join(","),
              ...(mediaId === undefined ? {} : { mediaId }),
            },
          },
          { init: { signal } },
        ),
      ),
  })

export const userListsQueryOptions = (
  userId: string,
  page: number,
  contentRatings: readonly ContentRating[],
) =>
  queryOptions({
    queryKey: ["lists", "user", userId, { page, contentRatings }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users[":id"].lists.$get(
          {
            param: { id: userId },
            query: {
              page: String(page),
              perPage: String(USER_LISTS_PER_PAGE),
              contentRating: contentRatings.join(","),
            },
          },
          { init: { signal } },
        ),
      ),
  })

export const listQueryOptions = (listId: string, contentRatings: readonly ContentRating[]) =>
  queryOptions({
    queryKey: ["lists", "detail", listId, { contentRatings }],
    queryFn: async ({ signal }) => {
      const response = await api.lists[":id"].$get(
        { param: { id: listId }, query: { contentRating: contentRatings.join(",") } },
        { init: { signal } },
      )

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })

const invalidateLists = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["lists"] }),
    queryClient.invalidateQueries({ queryKey: ["users", "profile"] }),
  ])
const isListDetail = (value: unknown): value is ListDetail =>
  typeof value === "object" && value !== null && "items" in value
const isListPage = (value: unknown): value is { data: ListSummary[] } =>
  typeof value === "object" && value !== null && "data" in value && Array.isArray(value.data)
const mapCachedLists = (
  queryClient: QueryClient,
  listId: string,
  update: <T extends { id: string; upvoteCount: number; viewerVoted: boolean }>(list: T) => T,
) => {
  queryClient.setQueriesData<unknown>({ queryKey: ["lists"] }, (cached: unknown) => {
    if (isListDetail(cached)) {
      return cached.id === listId ? update(cached) : cached
    }

    if (isListPage(cached)) {
      return {
        ...cached,
        data: cached.data.map((list) => (list.id === listId ? update(list) : list)),
      }
    }

    return cached
  })
}

export function useCreateList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (json: CreateListInput) => {
      const response = await api.users.me.lists.$post({ json })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: () => invalidateLists(queryClient),
  })
}

export function useUpdateList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...json }: UpdateListInput & { id: string }) => {
      const response = await api.lists[":id"].$patch({ param: { id }, json })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: () => invalidateLists(queryClient),
  })
}

export function useDeleteList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.lists[":id"].$delete({ param: { id } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["lists"],
          predicate: (query) => query.queryKey[1] !== "detail",
        }),
        queryClient.invalidateQueries({ queryKey: ["users", "profile"] }),
      ]),
  })
}

export function useVoteList() {
  const queryClient = useQueryClient()
  const apply = (id: string, voted: boolean, upvoteCount?: number) => {
    mapCachedLists(queryClient, id, (list) => {
      let delta = 0

      if (voted !== list.viewerVoted) {
        delta = voted ? 1 : -1
      }

      return {
        ...list,
        viewerVoted: voted,
        upvoteCount: upvoteCount ?? Math.max(list.upvoteCount + delta, 0),
      }
    })
  }

  return useMutation({
    mutationFn: async ({ id, voted }: { id: string; voted: boolean }) => {
      const request = { param: { id } }
      const response = voted
        ? await api.lists[":id"].vote.$put(request)
        : await api.lists[":id"].vote.$delete(request)

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: ({ id, voted }) => {
      apply(id, voted)
    },
    onError: (_error, { id, voted }) => {
      apply(id, !voted)
    },
    onSuccess: (result, { id }) => {
      apply(id, result.viewerVoted, result.upvoteCount)
    },
  })
}

export function useToggleListItem() {
  const queryClient = useQueryClient()
  const setHasMedia = (listId: string, mediaId: string, hasMedia: boolean) => {
    queryClient.setQueriesData<{ data: MyList[] }>(
      {
        queryKey: ["lists", "mine"],
        predicate: ({ queryKey: [, , filters] }) =>
          typeof filters === "object" &&
          filters !== null &&
          "mediaId" in filters &&
          filters.mediaId === mediaId,
      },
      (cached) =>
        cached === undefined
          ? cached
          : {
              ...cached,
              data: cached.data.map((list) => (list.id === listId ? { ...list, hasMedia } : list)),
            },
    )
  }

  return useMutation({
    mutationFn: async ({
      listId,
      mediaId,
      add,
    }: {
      listId: string
      mediaId: string
      add: boolean
    }) => {
      if (add) {
        const response = await api.lists[":id"].items.$post({
          param: { id: listId },
          json: { mediaId },
        })

        return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
      }

      const response = await api.lists[":id"].items[":mediaId"].$delete({
        param: { id: listId, mediaId },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: ({ listId, mediaId, add }) => {
      setHasMedia(listId, mediaId, add)
    },
    onError: (_error, { listId, mediaId, add }) => {
      setHasMedia(listId, mediaId, !add)
    },
    onSettled: () => invalidateLists(queryClient),
  })
}
