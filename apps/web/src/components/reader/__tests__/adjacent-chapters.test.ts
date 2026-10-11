import { describe, expect, it } from "vitest"
import { getAdjacentChapters } from "../adjacent-chapters"

const chapters = [
  { id: "en-1", number: 1, language: "en" },
  { id: "pt-1", number: 1, language: "pt_br" },
  { id: "en-2", number: 2, language: "en" },
  { id: "en-2-alt", number: 2, language: "en" },
  { id: "en-4", number: 4, language: "en" },
  { id: "pt-3", number: 3, language: "pt_br" },
]

describe("getAdjacentChapters", () => {
  it("finds the nearest chapters in the same language, skipping gaps", () => {
    const { previous, next } = getAdjacentChapters(chapters, chapters[2]!)

    expect(previous?.id).toBe("en-1")
    expect(next?.id).toBe("en-4")
  })

  it("ignores other uploads of the same chapter number", () => {
    const { previous, next } = getAdjacentChapters(chapters, chapters[3]!)

    expect(previous?.id).toBe("en-1")
    expect(next?.id).toBe("en-4")
  })

  it("returns null at either end", () => {
    expect(getAdjacentChapters(chapters, chapters[0]!).previous).toBeNull()
    expect(getAdjacentChapters(chapters, chapters[4]!).next).toBeNull()
  })

  it("never crosses languages", () => {
    const { previous, next } = getAdjacentChapters(chapters, chapters[1]!)

    expect(previous).toBeNull()
    expect(next?.id).toBe("pt-3")
  })
})
