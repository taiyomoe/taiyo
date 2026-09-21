import { describe, expect, it } from "vitest"
import { toContentRating } from "../to-content-rating"

describe("toContentRating", () => {
  it("should return NORMAL for 'safe'", () => {
    expect(toContentRating("safe")).toBe("NORMAL")
  })

  it("should return SUGGESTIVE for 'suggestive'", () => {
    expect(toContentRating("suggestive")).toBe("SUGGESTIVE")
  })

  it("should return NSFW for 'erotica'", () => {
    expect(toContentRating("erotica")).toBe("NSFW")
  })

  it("should return NSFW for 'pornographic'", () => {
    expect(toContentRating("pornographic")).toBe("NSFW")
  })

  it("should return NSFW for unknown values", () => {
    expect(toContentRating("unknown")).toBe("NSFW")
    expect(toContentRating("")).toBe("NSFW")
    expect(toContentRating("random")).toBe("NSFW")
  })

  it("should be case insensitive", () => {
    expect(toContentRating("Safe")).toBe("NORMAL")
    expect(toContentRating("SAFE")).toBe("NORMAL")
    expect(toContentRating("Suggestive")).toBe("SUGGESTIVE")
    expect(toContentRating("SUGGESTIVE")).toBe("SUGGESTIVE")
  })
})
