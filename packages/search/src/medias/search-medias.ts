import type { Meilisearch } from "meilisearch"
import { FilterSpec, translateFilter } from "../utils/filter-translator"
import { MediaDocument } from "./get-media-document"
import { SearchMediasInput, type MediaSort } from "./media-search-schemas"

/**
 * Public sort field → internal Meilisearch attribute. `mainTitle` maps to
 * `_sortMainTitle` (a lowercased mirror) so alphabetical ordering is
 * case-insensitive; the internal field is excluded from `displayedAttributes`
 * so consumers never see it.
 */
const sortFieldToAttribute = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  startDate: "startDate",
  endDate: "endDate",
  mainTitle: "_sortMainTitle",
} satisfies Record<MediaSort[number]["field"], string>
const mediaFilterSpec = {
  type: { kind: "enum", attr: "type" },
  status: { kind: "enum", attr: "status" },
  source: { kind: "enum", attr: "source" },
  demography: { kind: "enum", attr: "demography" },
  countryOfOrigin: { kind: "enum", attr: "countryOfOrigin" },
  contentRating: { kind: "enum", attr: "contentRating" },
  flag: { kind: "enum", attr: "flag" },
  tags: { kind: "array", attr: "tagKeys" },
  spoilerTags: { kind: "array", attr: "spoilerTagKeys" },
  linkProviders: { kind: "array", attr: "linkProviders" },
  titleLanguages: { kind: "array", attr: "titleLanguages" },
  chapterLanguages: { kind: "array", attr: "chapterLanguages" },
  coverLanguages: { kind: "array", attr: "coverLanguages" },
  authors: { kind: "array", attr: "authorIds" },
  artists: { kind: "array", attr: "artistIds" },
  createdAt: { kind: "date", attr: "createdAt" },
  updatedAt: { kind: "date", attr: "updatedAt" },
  startDate: { kind: "date", attr: "startDate" },
  endDate: { kind: "date", attr: "endDate" },
} satisfies FilterSpec<MediaDocument>

export const searchMedias = async (
  { meili, mediasIndex }: { meili: Meilisearch; mediasIndex: string },
  input: SearchMediasInput,
) => {
  const filter = translateFilter(mediaFilterSpec, input.filter)
  const sort = input.sort.map((s) => `${sortFieldToAttribute[s.field]}:${s.direction}`)
  const result = await meili.index<MediaDocument>(mediasIndex).search(input.q, {
    filter,
    sort,
    page: input.page,
    hitsPerPage: input.perPage,
  })

  return {
    hits: result.hits,
    page: result.page,
    perPage: result.hitsPerPage,
    total: result.totalHits,
  }
}
