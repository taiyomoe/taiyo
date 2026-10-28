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

export function useSetLibraryStatus(mediaId: string) {
  const queryClient = useQueryClient()
  const { queryKey } = libraryEntryQueryOptions(mediaId)

  return useMutation({
    mutationFn: async (status: LibraryStatus | null) => {
      if (status === null) {
        const response = await api.users.me.library[":mediaId"].$delete({ param: { mediaId } })

        return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
      }

      const response = await api.users.me.library[":mediaId"].$put({
        param: { mediaId },
        json: { status },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: async (status) => {
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
              createdAt: previous?.createdAt ?? now,
              updatedAt: now,
            },
      )

      return { previous }
    },
    onError: (_error, _status, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
