import type { InferResponseType } from "hono/client"
import { queryOptions } from "@tanstack/react-query"
import { isDefined, pickBy } from "remeda"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrapEnvelope } from "@/lib/envelope"

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

export const CHAPTER_SORTS = ["newest", "oldest", "uploaded"] as const

export type ChapterSort = (typeof CHAPTER_SORTS)[number]

export type MediaChapterFilters = {
  contentRatings: readonly ContentRating[]
  language?: string | undefined
}

export type MediaChaptersParams = MediaChapterFilters & {
  page: number
  perPage: number
  sort: ChapterSort
  volume?: string | undefined
  search?: string | undefined
  unread: boolean
}

const SORT_QUERY = {
  newest: { sort: "number", order: "desc" },
  oldest: { sort: "number", order: "asc" },
  uploaded: { sort: "createdAt", order: "desc" },
} as const satisfies Record<ChapterSort, { sort: string; order: string }>

export const mediaChaptersQueryOptions = (
  mediaId: string,
  { contentRatings, language, page, perPage, sort, volume, search, unread }: MediaChaptersParams,
) =>
  queryOptions({
    queryKey: [
      "medias",
      mediaId,
      "chapters",
      { contentRatings, language, page, perPage, sort, volume, search, unread },
    ],
    queryFn: async ({ signal }) => {
      const response = await api.medias[":id"].chapters.$get(
        {
          param: { id: mediaId },
          query: pickBy(
            {
              contentRating: contentRatings.join(","),
              language,
              volume,
              search,
              page: String(page),
              perPage: String(perPage),
              unread: unread ? "true" : undefined,
              ...SORT_QUERY[sort],
            },
            isDefined,
          ),
        },
        { init: { signal } },
      )

      return unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })

export type MediaChapter = InferResponseType<
  (typeof api.medias)[":id"]["chapters"]["$get"],
  200
>["data"][number]

export const mediaChapterFacetsQueryOptions = (
  mediaId: string,
  { contentRatings, language }: MediaChapterFilters,
) =>
  queryOptions({
    queryKey: ["medias", mediaId, "chapters", "facets", { contentRatings, language }],
    queryFn: async ({ signal }) =>
      (
        await unwrapEnvelope(
          await api.medias[":id"].chapters.facets.$get(
            {
              param: { id: mediaId },
              query: pickBy({ contentRating: contentRatings.join(","), language }, isDefined),
            },
            { init: { signal } },
          ),
        )
      ).data,
  })
