import { describe, expect, it } from "vitest"
import { toTags } from "../to-tags"

describe("toTags", () => {
  describe("input handling", () => {
    it("should return empty array for null input", () => {
      expect(toTags(null)).toEqual([])
    })

    it("should return empty array for empty array input", () => {
      expect(toTags([])).toEqual([])
    })
  })

  describe("valid tags", () => {
    it("should convert valid uppercase tag keys", () => {
      const result = toTags(["ACTION", "COMEDY"])

      expect(result).toEqual([
        { key: "ACTION", isSpoiler: false },
        { key: "COMEDY", isSpoiler: false },
      ])
    })

    it("should set isSpoiler to false for all tags", () => {
      const result = toTags(["ACTION", "DRAMA", "ROMANCE"])

      for (const tag of result) {
        expect(tag.isSpoiler).toBe(false)
      }
    })
  })

  describe("normalization - case conversion", () => {
    it("should convert lowercase tags to uppercase", () => {
      const result = toTags(["action", "comedy"])

      expect(result).toEqual([
        { key: "ACTION", isSpoiler: false },
        { key: "COMEDY", isSpoiler: false },
      ])
    })

    it("should convert mixed case tags to uppercase", () => {
      const result = toTags(["Action", "CoMeDy", "DRAMA"])

      expect(result).toEqual([
        { key: "ACTION", isSpoiler: false },
        { key: "COMEDY", isSpoiler: false },
        { key: "DRAMA", isSpoiler: false },
      ])
    })
  })

  describe("normalization - space to underscore", () => {
    it("should replace spaces with underscores", () => {
      const result = toTags(["slice of life", "sci fi"])

      expect(result).toEqual([
        { key: "SLICE_OF_LIFE", isSpoiler: false },
        { key: "SCI_FI", isSpoiler: false },
      ])
    })

    it("should handle multiple words with spaces", () => {
      const result = toTags(["boys love"])

      expect(result).toEqual([{ key: "BOYS_LOVE", isSpoiler: false }])
    })

    it("should handle mixed case with spaces", () => {
      const result = toTags(["Slice Of Life", "Boys Love"])

      expect(result).toEqual([
        { key: "SLICE_OF_LIFE", isSpoiler: false },
        { key: "BOYS_LOVE", isSpoiler: false },
      ])
    })
  })

  describe("invalid tags", () => {
    it("should skip invalid tag keys", () => {
      const result = toTags(["ACTION", "INVALID_TAG", "COMEDY"])

      expect(result).toEqual([
        { key: "ACTION", isSpoiler: false },
        { key: "COMEDY", isSpoiler: false },
      ])
    })

    it("should return empty array when all tags are invalid", () => {
      const result = toTags(["INVALID1", "INVALID2"])

      expect(result).toEqual([])
    })

    it("should skip invalid tags with spaces", () => {
      const result = toTags(["ACTION", "invalid tag with spaces", "COMEDY"])

      expect(result).toEqual([
        { key: "ACTION", isSpoiler: false },
        { key: "COMEDY", isSpoiler: false },
      ])
    })
  })
})
