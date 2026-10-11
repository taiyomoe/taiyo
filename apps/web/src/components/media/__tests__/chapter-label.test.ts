import { describe, expect, it } from "vitest"
import { getChapterLabel, languageName } from "../chapter-label"

describe("getChapterLabel", () => {
  it("prefixes the volume when there is one", () => {
    expect(getChapterLabel({ number: 12, volume: "3", title: "Ghosts", language: "en" })).toEqual({
      heading: "Vol. 3 · Ch. 12",
      title: "Ghosts",
      language: "English",
    })
  })

  it("drops the volume when it is null", () => {
    expect(getChapterLabel({ number: 12, volume: null, title: "Ghosts", language: "en" })).toEqual({
      heading: "Ch. 12",
      title: "Ghosts",
      language: "English",
    })
  })

  it("keeps a null title null", () => {
    expect(
      getChapterLabel({ number: 1, volume: null, title: null, language: "en" }).title,
    ).toBeNull()
  })

  it("keeps fractional chapter numbers", () => {
    expect(
      getChapterLabel({ number: 10.5, volume: null, title: null, language: "en" }).heading,
    ).toBe("Ch. 10.5")
  })
})

describe("languageName", () => {
  it("names regional variants", () => {
    expect(languageName("pt_br")).toBe("Brazilian Portuguese")
  })

  it("falls back to the code when Intl cannot name it", () => {
    expect(languageName("not a language")).toBe("not a language")
  })
})
