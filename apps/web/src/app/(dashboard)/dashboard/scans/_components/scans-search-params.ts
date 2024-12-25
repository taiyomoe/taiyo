import { DEFAULT_TASKS_LIST_PER_PAGE } from "@taiyomoe/constants"
import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import { dateFilterParser } from "~/utils/search-params-parsers"

export const scansSearchParams = {
  ...dateFilterParser("createdAt"),
  ...dateFilterParser("updatedAt"),
  ...dateFilterParser("deletedAt"),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(DEFAULT_TASKS_LIST_PER_PAGE),
}

export const scansSearchParamsCache = createSearchParamsCache(scansSearchParams)
