import { describe, expect, test } from "vitest"
import {
  toChapterNumber,
  toGroupValues,
  toMediaLanguage,
  toMediaLinks,
  toSupportedLanguage,
  toTagKey,
} from "../mappings"

describe("languages", () => {
  test("maps MangaDex codes to Taiyō's", () => {
    expect(toMediaLanguage("pt-br")).toBe("pt_br")
    expect(toMediaLanguage("ja-ro")).toBe("ja_ro")
    expect(toMediaLanguage("ru")).toBeNull()
    expect(toSupportedLanguage("pt")).toBe("pt_pt")
    expect(toSupportedLanguage("ja")).toBeNull()
  })
})

describe("toMediaLinks", () => {
  test("turns MangaDex IDs and slugs into Taiyō links", () => {
    expect(
      toMediaLinks({
        al: "118586",
        mal: "126287",
        ap: "frieren-beyond-journeys-end",
        bw: "series/260459/list",
        kt: "56355",
        mu: "ugf5dzu",
        raw: "https://www.sunday-webry.com/detail.php?title_id=1093",
        engtl: "not a url",
        bl: "832389",
      }),
    ).toEqual({
      anilist: 118586,
      myAnimeList: 126287,
      animePlanet: "https://www.anime-planet.com/manga/frieren-beyond-journeys-end",
      bookWalker: "https://bookwalker.jp/series/260459/list",
      kitsu: "https://kitsu.app/manga/56355",
      mangaUpdates: "https://www.mangaupdates.com/series/ugf5dzu",
      raw: "https://www.sunday-webry.com/detail.php?title_id=1093",
    })
    expect(toMediaLinks({ mu: "153337" }).mangaUpdates).toBe(
      "https://www.mangaupdates.com/series.html?id=153337",
    )
  })
})

describe("toTagKey", () => {
  test("matches MangaDex tags by their English name", () => {
    expect(toTagKey("Sci-Fi")).toBe("SCI_FI")
    expect(toTagKey("Boys' Love")).toBe("BOYS_LOVE")
    expect(toTagKey("Long Strip")).toBe("LONG_STRIP")
    expect(toTagKey("Not a tag")).toBeNull()
  })
})

describe("toChapterNumber", () => {
  test("reads numbers, and makes a oneshot chapter 0", () => {
    expect(toChapterNumber("12.5", "2")).toBe(12.5)
    expect(toChapterNumber(null, null)).toBe(0)
    expect(toChapterNumber("Extra", null)).toBeNull()
  })

  test("leaves out a whole volume uploaded as one chapter", () => {
    expect(toChapterNumber(null, "3")).toBeNull()
  })
})

describe("toGroupValues", () => {
  test("keeps only usable contacts", () => {
    expect(
      toGroupValues({
        id: "g",
        name: " Blue Solo ",
        discord: "XN3zX9f",
        website: "https://www.bluesolo.org/",
        twitter: "nope",
        contactEmail: "bluesoloscans@gmail.com",
        description: "",
      }),
    ).toEqual({
      name: "Blue Solo",
      description: null,
      website: "https://www.bluesolo.org/",
      x: null,
      discord: "https://discord.gg/XN3zX9f",
      email: "bluesoloscans@gmail.com",
    })
  })
})
