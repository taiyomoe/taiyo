import type { InferResponseType } from "hono/client"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { type QueryClient, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { libraryEntryQueryOptions } from "@/features/library/api/library"
import { applyScoreChange } from "@/features/ratings/lib/ratings"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type MediaStats = InferResponseType<(typeof api.medias)[":id"]["stats"]["$get"], 200>["data"]

type LibraryPage = InferResponseType<typeof api.users.me.library.$get, 200>

const statsKey = (mediaId: string) => ["medias", mediaId, "stats"] as const
const ratingMutationKey = (mediaId: string) => ["rating", mediaId] as const

export const mediaStatsQueryOptions = (mediaId: string, contentRatings: readonly ContentRating[]) =>
  queryOptions({
    queryKey: [...statsKey(mediaId), { contentRatings }] as const,
    queryFn: async ({ signal }) => {
      const response = await api.medias[":id"].stats.$get(
        { param: { id: mediaId }, query: { contentRating: contentRatings.join(",") } },
        { init: { signal } },
      )

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })

type ScoreChange = { mediaId: string; score: number | null }

const setCachedScore = (queryClient: QueryClient, { mediaId, score }: ScoreChange) => {
  const { queryKey } = libraryEntryQueryOptions(mediaId)
  const previous = queryClient.getQueryData(queryKey)?.score ?? null

  queryClient.setQueryData(queryKey, (data) => (data === undefined ? data : { ...data, score }))
  queryClient.setQueriesData<MediaStats>({ queryKey: statsKey(mediaId) }, (stats) =>
    stats === undefined ? stats : applyScoreChange(stats, previous, score),
  )
  queryClient.setQueriesData<LibraryPage>({ queryKey: ["library", "list"] }, (page) =>
    page === undefined
      ? page
      : {
          ...page,
          data: page.data.map((entry) => (entry.mediaId === mediaId ? { ...entry, score } : entry)),
        },
  )

  return previous
}

export function useRateMedia(mediaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ratingMutationKey(mediaId),
    scope: { id: `rating:${mediaId}` },
    mutationFn: async (score: number | null) => {
      if (score === null) {
        const response = await api.medias[":id"].rating.$delete({ param: { id: mediaId } })

        return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
      }

      const response = await api.medias[":id"].rating.$put({
        param: { id: mediaId },
        json: { score },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: async (score) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: libraryEntryQueryOptions(mediaId).queryKey }),
        queryClient.cancelQueries({ queryKey: statsKey(mediaId) }),
      ])

      return { previous: setCachedScore(queryClient, { mediaId, score }) }
    },
    onError: (error, score, context) => {
      if (context !== undefined) {
        setCachedScore(queryClient, { mediaId, score: context.previous })
      }

      toastManager.add({
        title: score === null ? m.rating_clear_error() : m.rating_save_error(),
        description: getErrorMessage(error),
        type: "error",
      })
    },
    onSettled: () =>
      queryClient.isMutating({ mutationKey: ratingMutationKey(mediaId) }) > 1
        ? undefined
        : Promise.all([
            queryClient.invalidateQueries({ queryKey: libraryEntryQueryOptions(mediaId).queryKey }),
            queryClient.invalidateQueries({ queryKey: statsKey(mediaId) }),
            queryClient.invalidateQueries({ queryKey: ["library", "list"] }),
          ]),
  })
}
