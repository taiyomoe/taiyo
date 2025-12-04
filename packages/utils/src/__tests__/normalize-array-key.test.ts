import { describe, expect, it } from "vitest"
import { normalizeArrayKey } from "../normalize-array-key"

describe("normalizeArrayKey", () => {
  it("should convert single bracket notation to dot notation", () => {
    expect(normalizeArrayKey("covers[0]")).toBe("covers.0")
    expect(normalizeArrayKey("titles[1]")).toBe("titles.1")
    expect(normalizeArrayKey("genres[2]")).toBe("genres.2")
  })

  it("should convert bracket notation with nested properties", () => {
    expect(normalizeArrayKey("covers[0].file")).toBe("covers.0.file")
    expect(normalizeArrayKey("covers[0].language")).toBe("covers.0.language")
    expect(normalizeArrayKey("titles[1].title")).toBe("titles.1.title")
  })

  it("should convert multiple bracket notations in the same key", () => {
    expect(normalizeArrayKey("items[0][1]")).toBe("items.0.1")
    expect(normalizeArrayKey("data[0].items[1]")).toBe("data.0.items.1")
    expect(normalizeArrayKey("covers[0].metadata[2]")).toBe(
      "covers.0.metadata.2",
    )
  })

  it("should preserve keys without brackets", () => {
    expect(normalizeArrayKey("title")).toBe("title")
    expect(normalizeArrayKey("description")).toBe("description")
    expect(normalizeArrayKey("contentRating")).toBe("contentRating")
  })

  it("should preserve dot notation in keys without brackets", () => {
    expect(normalizeArrayKey("user.name")).toBe("user.name")
    expect(normalizeArrayKey("media.type")).toBe("media.type")
  })

  it("should handle mixed bracket and dot notation", () => {
    expect(normalizeArrayKey("covers[0].file.name")).toBe("covers.0.file.name")
    expect(normalizeArrayKey("titles[1].metadata.id")).toBe(
      "titles.1.metadata.id",
    )
  })

  it("should handle large array indices", () => {
    expect(normalizeArrayKey("items[100]")).toBe("items.100")
    expect(normalizeArrayKey("data[999].value")).toBe("data.999.value")
  })

  it("should handle zero index", () => {
    expect(normalizeArrayKey("items[0]")).toBe("items.0")
    expect(normalizeArrayKey("covers[0].file")).toBe("covers.0.file")
  })

  it("should handle edge cases", () => {
    expect(normalizeArrayKey("")).toBe("")
    expect(normalizeArrayKey("[0]")).toBe(".0")
    expect(normalizeArrayKey("prefix[0]suffix")).toBe("prefix.0suffix")
  })

  it("should handle multiple consecutive brackets", () => {
    expect(normalizeArrayKey("matrix[0][1][2]")).toBe("matrix.0.1.2")
    expect(normalizeArrayKey("nested[0][1].value")).toBe("nested.0.1.value")
  })
})
