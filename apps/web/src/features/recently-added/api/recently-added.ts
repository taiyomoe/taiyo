import type { ContentRating } from "@/lib/settings"
import {
  DEFAULT_ADVANCED_SEARCH,
  SEARCH_PER_PAGE,
  toSearchBody,
} from "@/features/advanced-search/lib/advanced-search"
import { searchMediasQueryOptions } from "@/features/media/api/medias"

export const recentlyAddedQueryOptions = (
  contentRatings: readonly ContentRating[],
  page: number,
  perPage = SEARCH_PER_PAGE,
) =>
  searchMediasQueryOptions(
    toSearchBody({ ...DEFAULT_ADVANCED_SEARCH, sort: "latest" }, contentRatings, {
      page,
      perPage,
    }),
  )
