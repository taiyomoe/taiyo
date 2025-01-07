import {
  ContentRating,
  Flag,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@prisma/client"
import {
  DEFAULT_MEDIAS_LIST_PER_PAGE,
  MEDIAS_LIST_SORTABLE_FIELDS,
} from "@taiyomoe/constants"
import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import {
  dateFilterParser,
  enumFilterParser,
  nullableDateFilterParser,
  sortParser,
} from "~/utils/search-params-parsers"

export const mediasSearchParams = {
  ...dateFilterParser("createdAt"),
  ...dateFilterParser("updatedAt"),
  ...nullableDateFilterParser("deletedAt"),
  ...nullableDateFilterParser("startDate", false),
  ...nullableDateFilterParser("endDate", false),
  ...enumFilterParser("contentRating", ContentRating),
  // one shot
  ...enumFilterParser("type", MediaType),
  ...enumFilterParser("status", MediaStatus),
  ...enumFilterParser("source", MediaSource),
  ...enumFilterParser("demography", MediaDemography),
  ...enumFilterParser("countryOfOrigin", MediaCountryOfOrigin),
  // genres
  // tags
  ...enumFilterParser("flag", Flag),
  sort: sortParser(MEDIAS_LIST_SORTABLE_FIELDS).withDefault([
    ["createdAt", "desc"],
  ]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(DEFAULT_MEDIAS_LIST_PER_PAGE),
}

export const mediasSearchParamsCache =
  createSearchParamsCache(mediasSearchParams)
