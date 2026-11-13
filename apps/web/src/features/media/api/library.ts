import type { InferRequestType, InferResponseType } from "hono/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export type LibraryStatus = InferRequestType<
  (typeof api.users.me.library)[":mediaId"]["$put"]
>["json"]["status"]

export type ReadingProgress = InferResponseType<
  (typeof api.users.me.progress)[":mediaId"]["$get"],
  200
>["data"]

export const libraryEntryQueryOptions = (mediaId: string) =>
  queryOptions({
    queryKey: ["library", mediaId],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.users.me.library[":mediaId"].$get({ param: { mediaId } }, { init: { signal } }),
      ),
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

export function useSetLibraryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      mediaId,
      status,
      notify,
    }: {
      mediaId: string
      status: LibraryStatus | null
      notify?: boolean
    }) => {
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
    onMutate: async ({ mediaId, status, notify }) => {
      const { queryKey } = libraryEntryQueryOptions(mediaId)

      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData(queryKey)
      const now = new Date().toISOString()

      queryClient.setQueryData(
        queryKey,
        status === null
          ? null
          : {
              mediaId,
              status,
              notify: notify ?? previous?.notify ?? true,
              createdAt: previous?.createdAt ?? now,
              updatedAt: now,
            },
      )

      return { previous }
    },
    onError: (_error, { mediaId }, context) => {
      queryClient.setQueryData(libraryEntryQueryOptions(mediaId).queryKey, context?.previous)
    },
    onSettled: (_data, _error, { mediaId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: libraryEntryQueryOptions(mediaId).queryKey }),
        queryClient.invalidateQueries({ queryKey: ["recommendations"] }),
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === "medias" && query.queryKey[2] === "related",
        }),
      ]),
  })
}
