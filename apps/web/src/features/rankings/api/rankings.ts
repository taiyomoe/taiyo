import type { InferResponseType } from "hono/client"
import { type QueryClient, queryOptions } from "@tanstack/react-query"
import type { RankingCategory, RankingPeriod } from "@/features/rankings/lib/rankings"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export type ReadersRanking = InferResponseType<typeof api.rankings.readers.$get, 200>["data"]

export type GroupsRanking = InferResponseType<typeof api.rankings.groups.$get, 200>["data"]

export type TitlesRanking = InferResponseType<typeof api.rankings.medias.$get, 200>["data"]

export const readersRankingQueryOptions = (period: RankingPeriod, viewerId: string) =>
  queryOptions({
    // The viewer's own standing is part of the answer.
    queryKey: ["rankings", "readers", period, { viewerId }],
    queryFn: async ({ signal }) =>
      unwrap(await api.rankings.readers.$get({ query: { period } }, { init: { signal } })),
  })

export const groupsRankingQueryOptions = (period: RankingPeriod, viewerId: string) =>
  queryOptions({
    queryKey: ["rankings", "groups", period, { viewerId }],
    queryFn: async ({ signal }) =>
      unwrap(await api.rankings.groups.$get({ query: { period } }, { init: { signal } })),
  })

export const titlesRankingQueryOptions = (
  period: RankingPeriod,
  contentRatings: readonly ContentRating[],
) =>
  queryOptions({
    queryKey: ["rankings", "titles", period, { contentRatings }],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.rankings.medias.$get(
          { query: { period, contentRating: contentRatings.join(",") } },
          { init: { signal } },
        ),
      ),
  })

/** Loads the ranking a page shows into the cache. */
export const prefetchRanking = async (
  queryClient: QueryClient,
  { category, period }: { category: RankingCategory; period: RankingPeriod },
  { viewerId, contentRatings }: { viewerId: string; contentRatings: readonly ContentRating[] },
) => {
  if (category === "readers") {
    await queryClient.query(readersRankingQueryOptions(period, viewerId))
  } else if (category === "groups") {
    await queryClient.query(groupsRankingQueryOptions(period, viewerId))
  } else {
    await queryClient.query(titlesRankingQueryOptions(period, contentRatings))
  }
}
