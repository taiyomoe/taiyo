import type { InferRequestType, InferResponseType } from "hono/client"
import { noop, queryOptions } from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export const relatedMediasQueryOptions = (
  mediaId: string,
  contentRatings: readonly ContentRating[],
) =>
  queryOptions({
    queryKey: ["medias", mediaId, "related", { contentRatings }],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.medias[":id"].related.$get(
          { param: { id: mediaId }, query: { contentRating: contentRatings.join(",") } },
          { init: { signal } },
        ),
      ),
  })

export type RelatedMedias = InferResponseType<
  (typeof api.medias)[":id"]["related"]["$get"],
  200
>["data"]

export const myRecommendationsQueryOptions = (contentRatings: readonly ContentRating[]) =>
  queryOptions({
    queryKey: ["recommendations", { contentRatings }],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.users.me.recommendations.$get(
          { query: { contentRating: contentRatings.join(","), limit: "18" } },
          { init: { signal } },
        ),
      ),
    staleTime: 10 * 60 * 1000,
  })

export type RecommendationEvent = InferRequestType<typeof api.recommendations.events.$post>["json"]

export const recordRecommendationEvent = (event: RecommendationEvent) => {
  void api.recommendations.events.$post({ json: event }, { init: { keepalive: true } }).catch(noop)
}
