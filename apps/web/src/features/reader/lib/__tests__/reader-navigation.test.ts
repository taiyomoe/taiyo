import { describe, expect, it } from "vitest"
import {
  getAdjacentChapter,
  getChapterChoices,
  getChapterVersions,
  hasChapterGap,
} from "../reader-navigation"

const chapter = (
  id: string,
  number: number,
  {
    language = "en",
    groups = [],
    isExternal = false,
  }: { language?: "en" | "pt_br"; groups?: string[]; isExternal?: boolean } = {},
) => ({
  id,
  number,
  language,
  isExternal,
  groups: groups.map((group) => ({ id: group, name: group })),
})
const chapters = [
  chapter("1a", 1, { groups: ["a"] }),
  chapter("1pt", 1, { language: "pt_br" }),
  chapter("2b", 2, { groups: ["b"] }),
  chapter("2a", 2, { groups: ["a"] }),
  chapter("3x", 3, { groups: ["a"], isExternal: true }),
  chapter("3c", 3, { groups: ["c"] }),
  chapter("5b", 5, { groups: ["b"] }),
]
const at = (index: number) => {
  const row = chapters[index]

  if (row === undefined) {
    throw new Error(`No chapter at ${index}`)
  }

  return row
}

describe("getAdjacentChapter", () => {
  it("stays in the language and prefers the current group", () => {
    expect(getAdjacentChapter(chapters, at(0), "next")?.id).toBe("2a")
    expect(getAdjacentChapter(chapters, at(2), "prev")?.id).toBe("1a")
  })

  it("keeps the group even when its version is external", () => {
    expect(getAdjacentChapter(chapters, at(3), "next")?.id).toBe("3x")
  })

  it("prefers a hosted version when no group matches", () => {
    expect(getAdjacentChapter(chapters, at(2), "next")?.id).toBe("3c")
  })

  it("skips missing numbers and stops at either end", () => {
    expect(getAdjacentChapter(chapters, at(5), "next")?.id).toBe("5b")
    expect(getAdjacentChapter(chapters, at(6), "next")).toBeNull()
    expect(getAdjacentChapter(chapters, at(1), "prev")).toBeNull()
    expect(getAdjacentChapter(chapters, at(1), "next")).toBeNull()
  })
})

describe("getChapterVersions", () => {
  it("lists every version of the number, current language first", () => {
    expect(getChapterVersions(chapters, at(1)).map((row) => row.id)).toEqual(["1pt", "1a"])
  })
})

describe("getChapterChoices", () => {
  it("returns one chapter per number in the language, newest first", () => {
    expect(getChapterChoices(chapters, at(2)).map((row) => row.id)).toEqual([
      "5b",
      "3c",
      "2b",
      "1a",
    ])
  })
})

describe("hasChapterGap", () => {
  it("flags skipped whole numbers only", () => {
    expect(hasChapterGap(1, 2)).toBe(false)
    expect(hasChapterGap(1, 1.5)).toBe(false)
    expect(hasChapterGap(1.5, 2)).toBe(false)
    expect(hasChapterGap(2, 5)).toBe(true)
    expect(hasChapterGap(5, 2)).toBe(true)
  })
})
