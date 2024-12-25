import { DEFAULT_SCANS_LIST_PER_PAGE } from "@taiyomoe/constants"
import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import {
  dateFilterParser,
  nullableDateFilterParser,
} from "~/utils/search-params-parsers"

export const scansSearchParams = {
  ...dateFilterParser("createdAt"),
  ...dateFilterParser("updatedAt"),
  ...nullableDateFilterParser("deletedAt"),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(DEFAULT_SCANS_LIST_PER_PAGE),
}

export const scansSearchParamsCache = createSearchParamsCache(scansSearchParams)
