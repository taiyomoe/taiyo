import type { InferRequestType, InferResponseType } from "hono/client"
import { queryOptions, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

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

export const useInvalidateMedia = () => {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["medias"] }),
      queryClient.invalidateQueries({ queryKey: ["media-suggestions"] }),
    ])
}
