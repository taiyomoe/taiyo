import type { InferResponseType } from "hono/client"
import { queryOptions } from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrapEnvelope } from "@/lib/envelope"

const MAX_PER_PAGE = 100

export const latestChaptersQueryOptions = (
  contentRatings: readonly ContentRating[],
  perPage: number,
) =>
  queryOptions({
    queryKey: ["chapters", "latest", { contentRatings, perPage }],
    queryFn: async ({ signal }) =>
      (
        await unwrapEnvelope(
          await api.chapters.latest.$get(
            { query: { contentRating: contentRatings.join(","), perPage: String(perPage) } },
            { init: { signal } },
          ),
        )
      ).data,
  })

export type LatestChapter = InferResponseType<typeof api.chapters.latest.$get, 200>["data"][number]

export const latestMediaUpdatesQueryOptions = (
  contentRatings: readonly ContentRating[],
  page: number,
  perPage: number,
) =>
  queryOptions({
    queryKey: ["chapters", "latest", "medias", { contentRatings, page, perPage }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.chapters.latest.medias.$get(
          {
            query: {
              contentRating: contentRatings.join(","),
              page: String(page),
              perPage: String(perPage),
            },
          },
          { init: { signal } },
        ),
      ),
  })

export type LatestMediaUpdate = InferResponseType<
  typeof api.chapters.latest.medias.$get,
  200
>["data"][number]

export const mediaLatestChaptersQueryOptions = (
  mediaId: string,
  contentRatings: readonly ContentRating[],
) =>
  queryOptions({
    queryKey: ["chapters", "latest", { mediaId, contentRatings }],
    queryFn: async ({ signal }) => {
      const chapters: LatestChapter[] = []

      for (let page = 1; ; page++) {
        const { data, meta } = await unwrapEnvelope(
          await api.chapters.latest.$get(
            {
              query: {
                contentRating: contentRatings.join(","),
                mediaId,
                page: String(page),
                perPage: String(MAX_PER_PAGE),
              },
            },
            { init: { signal } },
          ),
        )

        chapters.push(...data)

        if (chapters.length >= meta.total || data.length === 0) {
          return chapters
        }
      }
    },
  })
