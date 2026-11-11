import type { ContentRating } from "@/lib/settings"
import {
  DEFAULT_ADVANCED_SEARCH,
  toSearchBody,
} from "@/features/advanced-search/lib/advanced-search"
import { searchMediasQueryOptions } from "@/features/media/api/medias"

export const recentlyAddedQueryOptions = (contentRatings: readonly ContentRating[], page: number) =>
  searchMediasQueryOptions(
    toSearchBody({ ...DEFAULT_ADVANCED_SEARCH, sort: "latest", page }, contentRatings),
  )
