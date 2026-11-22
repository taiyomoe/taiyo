import type { InferRequestType, InferResponseType } from "hono/client"
import { type QueryClient, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { LIBRARY_SORTS } from "@/features/library/lib/library-search"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export type LibraryStatus = InferRequestType<
  (typeof api.users.me.library)[":mediaId"]["$put"]
>["json"]["status"]

export type LibrarySort = (typeof LIBRARY_SORTS)[number]

export type LibraryEntry = InferResponseType<typeof api.users.me.library.$get, 200>["data"][number]

export type LibraryCounts = InferResponseType<typeof api.users.me.library.counts.$get, 200>["data"]

export type ReadingProgress = InferResponseType<
  (typeof api.users.me.progress)[":mediaId"]["$get"],
  200
>["data"]

type LibraryPage = InferResponseType<typeof api.users.me.library.$get, 200>

export type LibraryFilters = {
  status: LibraryStatus | undefined
  sort: LibrarySort
  q: string
  page: number
  perPage: number
  contentRatings: readonly ContentRating[]
}

const libraryKeys = {
  all: ["library"] as const,
  entry: (mediaId: string) => ["library", "entry", mediaId] as const,
  list: ["library", "list"] as const,
  counts: ["library", "counts"] as const,
}

export const libraryEntryQueryOptions = (mediaId: string) =>
  queryOptions({
    queryKey: libraryKeys.entry(mediaId),
    queryFn: async ({ signal }) =>
      unwrap(
        await api.users.me.library[":mediaId"].$get({ param: { mediaId } }, { init: { signal } }),
      ),
  })

export const libraryQueryOptions = ({
  status,
  sort,
  q,
  page,
  perPage,
  contentRatings,
}: LibraryFilters) =>
  queryOptions({
    queryKey: [...libraryKeys.list, { status, sort, q, page, perPage, contentRatings }] as const,
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users.me.library.$get(
          {
            query: {
              page: String(page),
              perPage: String(perPage),
              sort,
              contentRating: contentRatings.join(","),
              ...(status === undefined ? {} : { status }),
              ...(q === "" ? {} : { q }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[2].status === status ? previous : undefined,
  })

export const libraryCountsQueryOptions = () =>
  queryOptions({
    queryKey: libraryKeys.counts,
    queryFn: async ({ signal }) =>
      unwrap(await api.users.me.library.counts.$get({}, { init: { signal } })),
  })

export const readingProgressQueryOptions = (
  mediaId: string,
  contentRatings: readonly ContentRating[],
) =>
  queryOptions({
    queryKey: ["progress", mediaId, { contentRatings }],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.users.me.progress[":mediaId"].$get(
          { param: { mediaId }, query: { contentRating: contentRatings.join(",") } },
          { init: { signal } },
        ),
      ),
  })

type StatusChange = { mediaId: string; status: LibraryStatus | null; notify?: boolean }

const findCachedEntry = (queryClient: QueryClient, mediaId: string) =>
  queryClient
    .getQueriesData<LibraryPage>({ queryKey: libraryKeys.list })
    .flatMap(([, page]) => page?.data ?? [])
    .find((entry) => entry.mediaId === mediaId)
/** Mirrors a status change in every cached library page and in the counts. */
const applyToLists = (queryClient: QueryClient, { mediaId, status, notify }: StatusChange) => {
  const previousStatus =
    findCachedEntry(queryClient, mediaId)?.status ??
    queryClient.getQueryData(libraryEntryQueryOptions(mediaId).queryKey)?.entry?.status ??
    null

  for (const [queryKey, page] of queryClient.getQueriesData<LibraryPage>({
    queryKey: libraryKeys.list,
  })) {
    if (page === undefined || !page.data.some((entry) => entry.mediaId === mediaId)) {
      continue
    }

    const filters = queryKey.at(-1)
    const filteredStatus =
      typeof filters === "object" && filters !== null && "status" in filters
        ? filters.status
        : undefined

    queryClient.setQueryData<LibraryPage>(
      queryKey,
      status === null || (filteredStatus !== undefined && filteredStatus !== status)
        ? {
            ...page,
            data: page.data.filter((entry) => entry.mediaId !== mediaId),
            meta: { ...page.meta, total: Math.max(page.meta.total - 1, 0) },
          }
        : {
            ...page,
            data: page.data.map((entry) =>
              entry.mediaId === mediaId
                ? { ...entry, status, notify: notify ?? entry.notify }
                : entry,
            ),
          },
    )
  }

  queryClient.setQueryData<LibraryCounts>(libraryKeys.counts, (counts) => {
    if (counts === undefined || previousStatus === status) {
      return counts
    }

    const byStatus = { ...counts.byStatus }

    if (previousStatus !== null) {
      byStatus[previousStatus] = Math.max(byStatus[previousStatus] - 1, 0)
    }

    if (status !== null) {
      byStatus[status] += 1
    }

    return { total: Object.values(byStatus).reduce((sum, count) => sum + count, 0), byStatus }
  })
}

export function useSetLibraryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ mediaId, status, notify }: StatusChange) => {
      if (status === null) {
        const response = await api.users.me.library[":mediaId"].$delete({ param: { mediaId } })

        return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
      }

      const response = await api.users.me.library[":mediaId"].$put({
        param: { mediaId },
        json: notify === undefined ? { status } : { status, notify },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: async (change) => {
      const { mediaId, status, notify } = change
      const { queryKey } = libraryEntryQueryOptions(mediaId)

      await queryClient.cancelQueries({ queryKey: libraryKeys.all })

      const previous = queryClient.getQueryData(queryKey)?.entry ?? null
      const now = new Date().toISOString()

      applyToLists(queryClient, change)
      queryClient.setQueryData(queryKey, (data) => ({
        score: data?.score ?? null,
        entry:
          status === null
            ? null
            : {
                mediaId,
                status,
                notify: notify ?? previous?.notify ?? true,
                createdAt: previous?.createdAt ?? now,
                updatedAt: now,
              },
      }))

      return { previous }
    },
    onError: (_error, { mediaId }, context) => {
      queryClient.setQueryData(libraryEntryQueryOptions(mediaId).queryKey, (data) =>
        data === undefined ? data : { ...data, entry: context?.previous ?? null },
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: libraryKeys.all }),
  })
}
