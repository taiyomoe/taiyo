import { describe, expect, it } from "vitest"
import {
  advancedSearchSchema,
  countActiveFilters,
  EMPTY_FILTERS,
  parseAdvancedSearch,
  toSearchBody,
  toUrlSearch,
} from "../advanced-search"

const STAFF_ID = "0195f3c1-7c4a-7d4e-9f2b-3a6c1d8e9b20"
const normalize = (search: Record<string, unknown>) => advancedSearchSchema.parse(search)
const parse = (search: Record<string, unknown>) => parseAdvancedSearch(normalize(search))

describe("advancedSearchSchema", () => {
  it("fills every default for an empty URL", () => {
    expect(parse({})).toEqual({
      q: "",
      sort: "relevance",
      view: "cards",
      page: 1,
      ...EMPTY_FILTERS,
    })
  })

  it("splits comma lists, drops unknown values and duplicates", () => {
    const search = parse({
      tags: "ACTION,NOT_A_TAG,ROMANCE,ACTION",
      status: "RELEASING,nope",
      authors: `${STAFF_ID},not-a-uuid`,
      languages: "en,pt_br,xx",
    })

    expect(search.tags).toEqual(["ACTION", "ROMANCE"])
    expect(search.status).toEqual(["RELEASING"])
    expect(search.authors).toEqual([STAFF_ID])
    expect(search.languages).toEqual(["en", "pt_br"])
  })

  it("falls back to defaults on malformed values instead of failing", () => {
    const search = parse({ sort: "random", year: 12, page: -3, view: "table", tagMode: "maybe" })

    expect(search.sort).toBe("relevance")
    expect(search.year).toBeNull()
    expect(search.page).toBe(1)
    expect(search.view).toBe("cards")
    expect(search.tagMode).toBe("all")
  })

  it("keeps numeric queries the router parsed as numbers", () => {
    expect(parse({ q: 86 }).q).toBe("86")
  })
})

describe("URL normalization", () => {
  it("is idempotent, because the router re-validates what it writes back", () => {
    const once = normalize({
      tags: "ROMANCE,ACTION,ROMANCE,BOGUS",
      sort: "relevance",
      page: 1,
      q: "  frieren ",
      view: "cards",
    })

    expect(once).toEqual({ tags: "ROMANCE,ACTION", q: "frieren" })
    expect(normalize(once)).toEqual(once)
  })

  it("only ever holds strings, numbers and booleans so the URL stays readable", () => {
    const values = Object.values(
      normalize({ tags: "ACTION", year: 2020, translated: true, authors: STAFF_ID }),
    )

    expect(values.every((value) => ["string", "number", "boolean"].includes(typeof value))).toBe(
      true,
    )
  })
})

describe("toUrlSearch", () => {
  it("omits every default so a fresh search has a bare URL", () => {
    expect(Object.values(toUrlSearch(parse({}))).every((value) => value === undefined)).toBe(true)
  })

  it("round-trips a fully specified search", () => {
    const url = {
      q: "frieren",
      sort: "followers",
      type: "MANGA,MANHWA",
      status: "FINISHED",
      rating: "NORMAL,SUGGESTIVE",
      demographic: "SHOUNEN",
      origin: "JAPAN",
      year: 2020,
      tags: "ADVENTURE,FANTASY",
      excludedTags: "GORE",
      tagMode: "any",
      authors: STAFF_ID,
      artists: STAFF_ID,
      languages: "en",
      view: "grid",
      page: 3,
    } as const

    expect(toUrlSearch(parse(url))).toEqual({ ...url, translated: undefined })
    expect(normalize(toUrlSearch(parse(url)))).toEqual(normalize(url))
  })

  it("drops a tag listed as both included and excluded from the exclusions", () => {
    expect(toUrlSearch(parse({ tags: "ACTION", excludedTags: "ACTION,GORE" })).excludedTags).toBe(
      "GORE",
    )
  })

  it("only writes translated when no language narrows it", () => {
    expect(toUrlSearch(parse({ translated: true })).translated).toBe(true)
    expect(toUrlSearch(parse({ translated: true, languages: "en" })).translated).toBeUndefined()
  })
})

describe("countActiveFilters", () => {
  it("counts filters, not the query, sort or layout", () => {
    expect(countActiveFilters(parse({ q: "x", sort: "title", view: "list" }))).toBe(0)
    expect(countActiveFilters(parse({ tags: "ACTION", year: 2001, languages: "en" }))).toBe(3)
  })
})

describe("toSearchBody", () => {
  it("uses the reader's content ratings unless the URL picks some", () => {
    expect(toSearchBody(parse({}), ["NORMAL"]).filter.contentRating).toEqual({ in: ["NORMAL"] })
    expect(toSearchBody(parse({ rating: "NSFW" }), ["NORMAL"]).filter.contentRating).toEqual({
      in: ["NSFW"],
    })
  })

  it("ranks by followers when there is no query to be relevant to", () => {
    expect(toSearchBody(parse({}), []).sort).toEqual([{ field: "libraryCount", direction: "desc" }])
    expect(toSearchBody(parse({ q: "one piece" }), []).sort).toEqual([])
  })

  it("maps included and excluded tags with the chosen match mode", () => {
    expect(
      toSearchBody(parse({ tags: "ACTION,COMEDY", excludedTags: "GORE" }), []).filter.tags,
    ).toEqual({ hasAll: ["ACTION", "COMEDY"], hasAny: undefined, hasNone: ["GORE"] })
    expect(toSearchBody(parse({ tags: "ACTION,COMEDY", tagMode: "any" }), []).filter.tags).toEqual({
      hasAll: undefined,
      hasAny: ["ACTION", "COMEDY"],
      hasNone: undefined,
    })
  })

  it("turns a year into a UTC range covering the whole year", () => {
    expect(toSearchBody(parse({ year: 2020 }), []).filter.startDate).toEqual({
      between: ["2020-01-01T00:00:00.000Z", "2020-12-31T23:59:59.999Z"],
    })
  })

  it("requires chapters in any language, or in the picked languages", () => {
    const anyLanguage = toSearchBody(parse({ translated: true }), []).filter
    const english = toSearchBody(parse({ languages: "en" }), []).filter

    expect(anyLanguage.chapterCount).toEqual({ gte: 1 })
    expect(anyLanguage.chapterLanguages).toBeUndefined()
    expect(english.chapterLanguages).toEqual({ hasAny: ["en"] })
    expect(english.chapterCount).toBeUndefined()
  })
})
