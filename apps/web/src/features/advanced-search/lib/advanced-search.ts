import {
  CONTENT_RATINGS,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  SUPPORTED_LANGUAGES,
} from "@taiyomoe/db/constants"
import { z } from "zod"
import type { SearchMediasBody } from "@/features/media/api/medias"
import type { ContentRating } from "@/lib/settings"
import { isTagKey } from "./search-tags"

export const SEARCH_PER_PAGE = 24

export const SEARCH_MAX_RESULTS = 1000

export const SEARCH_VIEWS = ["cards", "list", "grid"] as const

export type SearchView = (typeof SEARCH_VIEWS)[number]

type Sort = NonNullable<SearchMediasBody["sort"]>

const BY_FOLLOWERS: Sort = [{ field: "libraryCount", direction: "desc" }]
const SEARCH_SORTS = {
  relevance: [],
  followers: BY_FOLLOWERS,
  "followers-asc": [{ field: "libraryCount", direction: "asc" }],
  latest: [{ field: "createdAt", direction: "desc" }],
  oldest: [{ field: "createdAt", direction: "asc" }],
  updated: [{ field: "updatedAt", direction: "desc" }],
  title: [{ field: "mainTitle", direction: "asc" }],
  "title-desc": [{ field: "mainTitle", direction: "desc" }],
  chapters: [{ field: "chapterCount", direction: "desc" }],
  "chapters-asc": [{ field: "chapterCount", direction: "asc" }],
  year: [{ field: "startDate", direction: "desc" }],
  "year-asc": [{ field: "startDate", direction: "asc" }],
} satisfies Record<string, Sort>

export type SearchSort = keyof typeof SEARCH_SORTS

const isSearchSort = (value: unknown): value is SearchSort =>
  typeof value === "string" && Object.hasOwn(SEARCH_SORTS, value)

export const MIN_YEAR = 1900

export const MAX_YEAR = 2100

const MAX_LIST_LENGTH = 50
const oneOf =
  <T extends string>(values: readonly T[]) =>
  (value: string): value is T =>
    values.some((candidate) => candidate === value)
const isUuid = (value: string) => z.uuid().safeParse(value).success
const splitList = <T extends string>(
  value: string | undefined,
  isValid: (item: string) => item is T,
) =>
  [
    ...new Set(
      (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(isValid),
    ),
  ].slice(0, MAX_LIST_LENGTH)
const csv = (values: readonly string[]) => (values.length === 0 ? undefined : values.join(","))
const list = (isValid: (item: string) => boolean) =>
  z
    .string()
    .optional()
    .transform((value) => csv(splitList(value, (item): item is string => isValid(item))))
    .catch(undefined)
const LIST_VALIDATORS = {
  type: oneOf(MEDIA_TYPES),
  status: oneOf(MEDIA_STATUSES),
  rating: oneOf(CONTENT_RATINGS),
  demographic: oneOf(MEDIA_DEMOGRAPHIES),
  origin: oneOf(MEDIA_COUNTRIES_OF_ORIGIN),
  tags: isTagKey,
  excludedTags: isTagKey,
  authors: (value: string): value is string => isUuid(value),
  artists: (value: string): value is string => isUuid(value),
  languages: oneOf(SUPPORTED_LANGUAGES),
}

export const advancedSearchSchema = z.object({
  q: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      const q = String(value ?? "")
        .trim()
        .slice(0, 200)

      return q === "" ? undefined : q
    })
    .catch(undefined),
  sort: z
    .custom<SearchSort>(isSearchSort)
    .optional()
    .transform((value) => (value === "relevance" ? undefined : value))
    .catch(undefined),
  type: list(LIST_VALIDATORS.type),
  status: list(LIST_VALIDATORS.status),
  rating: list(LIST_VALIDATORS.rating),
  demographic: list(LIST_VALIDATORS.demographic),
  origin: list(LIST_VALIDATORS.origin),
  year: z.coerce.number().int().min(MIN_YEAR).max(MAX_YEAR).optional().catch(undefined),
  tags: list(LIST_VALIDATORS.tags),
  excludedTags: list(LIST_VALIDATORS.excludedTags),
  tagMode: z.literal("any").optional().catch(undefined),
  authors: list(LIST_VALIDATORS.authors),
  artists: list(LIST_VALIDATORS.artists),
  translated: z.literal(true).optional().catch(undefined),
  languages: list(LIST_VALIDATORS.languages),
  view: z.enum(["list", "grid"]).optional().catch(undefined),
  page: z.coerce.number().int().min(2).max(100_000).optional().catch(undefined),
})

export type AdvancedSearchUrl = z.output<typeof advancedSearchSchema>

const DEFAULT_SORT: SearchSort = "relevance"
const DEFAULT_TAG_MODE: "all" | "any" = "all"
const DEFAULT_VIEW: SearchView = "cards"

export const parseAdvancedSearch = (url: AdvancedSearchUrl) => ({
  q: url.q ?? "",
  sort: url.sort ?? DEFAULT_SORT,
  type: splitList(url.type, LIST_VALIDATORS.type),
  status: splitList(url.status, LIST_VALIDATORS.status),
  rating: splitList(url.rating, LIST_VALIDATORS.rating),
  demographic: splitList(url.demographic, LIST_VALIDATORS.demographic),
  origin: splitList(url.origin, LIST_VALIDATORS.origin),
  year: url.year ?? null,
  tags: splitList(url.tags, LIST_VALIDATORS.tags),
  excludedTags: splitList(url.excludedTags, LIST_VALIDATORS.excludedTags),
  tagMode: url.tagMode ?? DEFAULT_TAG_MODE,
  authors: splitList(url.authors, LIST_VALIDATORS.authors),
  artists: splitList(url.artists, LIST_VALIDATORS.artists),
  translated: url.translated === true,
  languages: splitList(url.languages, LIST_VALIDATORS.languages),
  view: url.view ?? DEFAULT_VIEW,
  page: url.page ?? 1,
})

export type AdvancedSearch = ReturnType<typeof parseAdvancedSearch>

export const DEFAULT_ADVANCED_SEARCH = parseAdvancedSearch(advancedSearchSchema.parse({}))

export type AdvancedSearchFilters = Omit<AdvancedSearch, "q" | "sort" | "view" | "page">

export const EMPTY_FILTERS = {
  type: [],
  status: [],
  rating: [],
  demographic: [],
  origin: [],
  year: null,
  tags: [],
  excludedTags: [],
  tagMode: "all",
  authors: [],
  artists: [],
  translated: false,
  languages: [],
} satisfies AdvancedSearchFilters

export const toUrlSearch = (search: AdvancedSearch) => {
  const excludedTags = search.excludedTags.filter((tag) => !search.tags.includes(tag))

  return {
    q: search.q.trim() === "" ? undefined : search.q.trim(),
    sort: search.sort === "relevance" ? undefined : search.sort,
    type: csv(search.type),
    status: csv(search.status),
    rating: csv(search.rating),
    demographic: csv(search.demographic),
    origin: csv(search.origin),
    year: search.year ?? undefined,
    tags: csv(search.tags),
    excludedTags: csv(excludedTags),
    tagMode: search.tagMode === "any" && search.tags.length > 1 ? search.tagMode : undefined,
    authors: csv(search.authors),
    artists: csv(search.artists),
    translated: search.translated && search.languages.length === 0 ? true : undefined,
    languages: csv(search.languages),
    view: search.view === "cards" ? undefined : search.view,
    page: search.page === 1 ? undefined : search.page,
  } satisfies AdvancedSearchUrl
}

export const countActiveFilters = (search: AdvancedSearchFilters) =>
  [
    search.type,
    search.status,
    search.rating,
    search.demographic,
    search.origin,
    search.tags,
    search.excludedTags,
    search.authors,
    search.artists,
  ].filter((values) => values.length > 0).length +
  Number(search.year !== null) +
  Number(search.translated || search.languages.length > 0)

const nonEmpty = <T>(values: readonly T[]) => {
  const [first, ...rest] = values

  return first === undefined ? undefined : ([first, ...rest] satisfies [T, ...T[]])
}
const yearRange = (year: number) =>
  [
    new Date(Date.UTC(year, 0, 1)).toISOString(),
    new Date(Date.UTC(year + 1, 0, 1) - 1).toISOString(),
  ] as [string, string]

export const toSearchBody = (
  search: AdvancedSearch,
  defaultRatings: readonly ContentRating[],
  pagination: { page: number; perPage: number } = {
    page: search.page,
    perPage: SEARCH_PER_PAGE,
  },
) => {
  const q = search.q.trim()
  const included = nonEmpty(search.tags)
  const excluded = nonEmpty(search.excludedTags.filter((tag) => !search.tags.includes(tag)))
  const languages = nonEmpty(search.languages)
  const ratings = nonEmpty(search.rating) ?? nonEmpty([...defaultRatings])

  return {
    q,
    sort: search.sort === "relevance" && q === "" ? BY_FOLLOWERS : SEARCH_SORTS[search.sort],
    filter: {
      type: search.type.length === 0 ? undefined : { in: nonEmpty(search.type) },
      status: search.status.length === 0 ? undefined : { in: nonEmpty(search.status) },
      contentRating: ratings === undefined ? undefined : { in: ratings },
      demography:
        search.demographic.length === 0 ? undefined : { in: nonEmpty(search.demographic) },
      countryOfOrigin: search.origin.length === 0 ? undefined : { in: nonEmpty(search.origin) },
      tags:
        included === undefined && excluded === undefined
          ? undefined
          : {
              hasAll: search.tagMode === "all" ? included : undefined,
              hasAny: search.tagMode === "any" ? included : undefined,
              hasNone: excluded,
            },
      authors: search.authors.length === 0 ? undefined : { hasAny: nonEmpty(search.authors) },
      artists: search.artists.length === 0 ? undefined : { hasAny: nonEmpty(search.artists) },
      startDate: search.year === null ? undefined : { between: yearRange(search.year) },
      chapterLanguages: languages === undefined ? undefined : { hasAny: languages },
      chapterCount: search.translated && languages === undefined ? { gte: 1 } : undefined,
    },
    ...pagination,
  } satisfies SearchMediasBody
}
