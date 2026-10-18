import type { InferRequestType, InferResponseType } from "hono/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"

export const SUGGESTIONS_PER_PAGE = 20

export const mediaEditQueryOptions = (mediaId: string) =>
  queryOptions({
    queryKey: ["medias", mediaId, "edit"],
    queryFn: async ({ signal }) =>
      unwrap(await api.medias[":id"].edit.$get({ param: { id: mediaId } }, { init: { signal } })),
  })

export type MediaEditView = InferResponseType<
  (typeof api.medias)[":id"]["edit"]["$get"],
  200
>["data"]["current"]

export type MediaEditChanges = InferRequestType<(typeof api.medias)[":id"]["$patch"]>["json"]

export const suggestionQueueQueryOptions = (page: number) =>
  queryOptions({
    queryKey: ["media-suggestions", "queue", { page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["media-suggestions"].$get(
          { query: { page: String(page), perPage: String(SUGGESTIONS_PER_PAGE) } },
          { init: { signal } },
        ),
      ),
  })

export type MediaSuggestion = InferResponseType<
  (typeof api)["media-suggestions"]["$get"],
  200
>["data"][number]

export const mySuggestionsQueryOptions = (page: number) =>
  queryOptions({
    queryKey: ["media-suggestions", "mine", { page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users.me["media-suggestions"].$get(
          { query: { page: String(page), perPage: String(SUGGESTIONS_PER_PAGE) } },
          { init: { signal } },
        ),
      ),
  })

export const suggestionQueryOptions = (suggestionId: string) =>
  queryOptions({
    queryKey: ["media-suggestions", suggestionId],
    queryFn: async ({ signal }) =>
      unwrap(
        await api["media-suggestions"][":id"].$get(
          { param: { id: suggestionId } },
          { init: { signal } },
        ),
      ),
  })

export type MediaSuggestionDetail = InferResponseType<
  (typeof api)["media-suggestions"][":id"]["$get"],
  200
>["data"]

export const staffSearchQueryOptions = (search: string) =>
  queryOptions({
    queryKey: ["staffs", "search", search],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.staffs.$get(
          { query: { search, page: "1", perPage: "10" } },
          { init: { signal } },
        ),
      ),
  })

const useInvalidateMedia = () => {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["medias"] }),
      queryClient.invalidateQueries({ queryKey: ["media-suggestions"] }),
    ])
}

export function useSaveMediaEdit() {
  const invalidate = useInvalidateMedia()

  return useMutation({
    mutationFn: async ({ mediaId, changes }: { mediaId: string; changes: MediaEditChanges }) =>
      ensureSuccess(await api.medias[":id"].$patch({ param: { id: mediaId }, json: changes })),
    onSuccess: invalidate,
  })
}

export function useSuggestMediaEdit() {
  const invalidate = useInvalidateMedia()

  return useMutation({
    mutationFn: async ({
      mediaId,
      suggestionId,
      changes,
      note,
    }: {
      mediaId: string
      suggestionId: string | null
      changes: MediaEditChanges
      note: string
    }) =>
      ensureSuccess(
        suggestionId === null
          ? await api.medias[":id"].suggestions.$post({
              param: { id: mediaId },
              json: { changes, note },
            })
          : await api["media-suggestions"][":id"].$patch({
              param: { id: suggestionId },
              json: { changes, note },
            }),
      ),
    onSuccess: invalidate,
  })
}

export function useWithdrawSuggestion() {
  const invalidate = useInvalidateMedia()

  return useMutation({
    mutationFn: async (suggestionId: string) =>
      ensureSuccess(
        await api["media-suggestions"][":id"].withdraw.$post({ param: { id: suggestionId } }),
      ),
    onSuccess: invalidate,
  })
}

export function useReviewSuggestion() {
  const invalidate = useInvalidateMedia()

  return useMutation({
    mutationFn: async ({
      suggestionId,
      accept,
      note,
    }: {
      suggestionId: string
      accept: MediaEditChanges | null
      note: string
    }) =>
      ensureSuccess(
        accept === null
          ? await api["media-suggestions"][":id"].reject.$post({
              param: { id: suggestionId },
              json: { note },
            })
          : await api["media-suggestions"][":id"].accept.$post({
              param: { id: suggestionId },
              json: { changes: accept, note },
            }),
      ),
    onSuccess: invalidate,
  })
}
