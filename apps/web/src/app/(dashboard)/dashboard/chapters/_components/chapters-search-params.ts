import { ContentRating, Flag, Languages } from "@prisma/client"
import {
  CHAPTERS_LIST_SORTABLE_FIELDS,
  DEFAULT_CHAPTERS_LIST_PER_PAGE,
} from "@taiyomoe/constants"
import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import {
  dateFilterParser,
  enumFilterParser,
  nullableDateFilterParser,
  nullableNumberFilterParser,
  numberFilterParser,
  sortParser,
} from "~/utils/search-params-parsers"

export const chaptersSearchParams = {
  ...dateFilterParser("createdAt"),
  ...dateFilterParser("updatedAt"),
  ...nullableDateFilterParser("deletedAt"),
  ...numberFilterParser("number"),
  ...nullableNumberFilterParser("volume"),
  ...enumFilterParser("language", Languages),
  ...enumFilterParser("contentRating", ContentRating),
  ...enumFilterParser("flag", Flag),
  sort: sortParser(CHAPTERS_LIST_SORTABLE_FIELDS).withDefault([
    ["createdAt", "desc"],
  ]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(DEFAULT_CHAPTERS_LIST_PER_PAGE),
}

export const chaptersSearchParamsCache =
  createSearchParamsCache(chaptersSearchParams)
