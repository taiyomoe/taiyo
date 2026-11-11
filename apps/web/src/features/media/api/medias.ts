import type { InferRequestType, InferResponseType } from "hono/client"
import { queryOptions } from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrapEnvelope } from "@/lib/envelope"

export type SearchMediasBody = InferRequestType<typeof api.medias.search.$post>["json"]

export const searchMediasQueryOptions = (body: SearchMediasBody) =>
  queryOptions({
    queryKey: ["medias", "search", body],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(await api.medias.search.$post({ json: body }, { init: { signal } })),
  })

export const featuredMediasQueryOptions = (contentRatings: readonly ContentRating[]) =>
  queryOptions({
    queryKey: ["medias", "featured", { contentRatings }],
    queryFn: async ({ signal }) =>
      (
        await unwrapEnvelope(
          await api.medias.featured.$get(
            { query: { contentRating: contentRatings.join(",") } },
            { init: { signal } },
          ),
        )
      ).data,
  })

export type FeaturedMedia = InferResponseType<typeof api.medias.featured.$get, 200>["data"][number]

// The API caches this list for an hour, so the browser has no reason to refetch
// it within a visit either.
export const showcaseMediasQueryOptions = () =>
  queryOptions({
    queryKey: ["medias", "showcase"],
    queryFn: async ({ signal }) =>
      (await unwrapEnvelope(await api.medias.showcase.$get({}, { init: { signal } }))).data,
    staleTime: 60 * 60 * 1000,
  })

export type ShowcaseMedia = InferResponseType<typeof api.medias.showcase.$get, 200>["data"][number]

export const mediaQueryOptions = (mediaId: string) =>
  queryOptions({
    queryKey: ["medias", mediaId],
    queryFn: async ({ signal }) => {
      const response = await api.medias[":id"].$get(
        { param: { id: mediaId } },
        { init: { signal } },
      )

      return (await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)).data
    },
  })

export type Media = InferResponseType<(typeof api.medias)[":id"]["$get"], 200>["data"]
