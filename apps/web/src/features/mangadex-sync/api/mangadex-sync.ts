import type { InferResponseType } from "hono/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

const planEndpoint = api.medias[":id"]["mangadex-sync"]
const syncsEndpoint = api.medias[":id"]["mangadex-syncs"]
const syncEndpoint = api["mangadex-syncs"][":id"]

export type MangaDexPlan = InferResponseType<typeof planEndpoint.$get, 200>["data"]

export type MangaDexSyncSummary = InferResponseType<typeof syncsEndpoint.$get, 200>["data"][number]

export type MangaDexSyncItem = InferResponseType<
  typeof syncEndpoint.$get,
  200
>["data"]["items"][number]

export const isActiveMangaDexSync = (status: MangaDexSyncSummary["status"]) =>
  status === "PENDING" || status === "RUNNING"

export const mangaDexPlanQueryOptions = (mediaId: string, mangaDexId: string | null) =>
  queryOptions({
    queryKey: ["mangadex-sync", mediaId, "plan", mangaDexId],
    queryFn: async ({ signal }) =>
      unwrap(
        await planEndpoint.$get(
          { param: { id: mediaId }, query: mangaDexId === null ? {} : { mangaDexId } },
          { init: { signal } },
        ),
      ),
    // Each comparison walks the whole MangaDex feed: only refetch when asked to.
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  })

export const mangaDexSyncsQueryOptions = (mediaId: string) =>
  queryOptions({
    queryKey: ["mangadex-sync", mediaId, "syncs"],
    queryFn: async ({ signal }) =>
      unwrap(await syncsEndpoint.$get({ param: { id: mediaId } }, { init: { signal } })),
    refetchInterval: (query) =>
      query.state.data?.some((sync) => isActiveMangaDexSync(sync.status)) === true ? 3000 : false,
  })

export const mangaDexSyncQueryOptions = (syncId: string) =>
  queryOptions({
    queryKey: ["mangadex-sync", "sync", syncId],
    queryFn: async ({ signal }) => {
      const response = await syncEndpoint.$get({ param: { id: syncId } }, { init: { signal } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    refetchInterval: (query) =>
      query.state.data === undefined || isActiveMangaDexSync(query.state.data.status)
        ? 3000
        : false,
  })

export function useStartMangaDexSync(mediaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ mangaDexId, keys }: { mangaDexId: string | null; keys: string[] }) => {
      const response = await planEndpoint.$post({
        param: { id: mediaId },
        json: mangaDexId === null ? { keys } : { mangaDexId, keys },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["mangadex-sync", mediaId] }),
        queryClient.invalidateQueries({ queryKey: ["medias", mediaId] }),
      ]),
  })
}

export function useCancelMangaDexSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (syncId: string) => {
      const response = await syncEndpoint.cancel.$post({ param: { id: syncId } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["mangadex-sync"] }),
  })
}

export function useRefreshMangaDexMedia(mediaId: string) {
  const queryClient = useQueryClient()

  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["mangadex-sync", mediaId] }),
        queryClient.invalidateQueries({ queryKey: ["medias", mediaId] }),
      ]),
    [queryClient, mediaId],
  )
}
