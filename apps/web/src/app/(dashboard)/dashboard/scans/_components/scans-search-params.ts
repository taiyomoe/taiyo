import {
  DEFAULT_SCANS_LIST_PER_PAGE,
  SCANS_LIST_SORTABLE_FIELDS,
} from "@taiyomoe/constants"
import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import {
  dateFilterParser,
  nullableDateFilterParser,
  sortParser,
  textFilterParser,
} from "~/utils/search-params-parsers"

export const scansSearchParams = {
  ...dateFilterParser("createdAt"),
  ...dateFilterParser("updatedAt"),
  ...nullableDateFilterParser("deletedAt"),
  ...textFilterParser("name"),
  ...textFilterParser("description"),
  ...textFilterParser("website"),
  ...textFilterParser("discord"),
  ...textFilterParser("twitter"),
  ...textFilterParser("facebook"),
  ...textFilterParser("instagram"),
  ...textFilterParser("telegram"),
  ...textFilterParser("youtube"),
  ...textFilterParser("email"),
  sort: sortParser(SCANS_LIST_SORTABLE_FIELDS).withDefault([
    ["createdAt", "desc"],
  ]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(DEFAULT_SCANS_LIST_PER_PAGE),
}

export const scansSearchParamsCache = createSearchParamsCache(scansSearchParams)
