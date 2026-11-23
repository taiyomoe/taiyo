import { describe, expect, it } from "vitest"
import { countReviewCharacters, countReviewCodePoints, normalizeReviewBody } from "../review-body"

describe("normalizeReviewBody", () => {
  it("keeps line breaks and drops control characters", () => {
    expect(normalizeReviewBody("  First\r\nsecond\u0007  \n\n\n\nthird  ")).toBe(
      "First\nsecond\n\nthird",
    )
  })

  it("keeps markup and right-to-left text as typed", () => {
    const text = "<b>bold</b> **star** مراجعة"

    expect(normalizeReviewBody(text)).toBe(text)
  })
})

describe("countReviewCharacters", () => {
  it("counts an emoji as one character", () => {
    expect(countReviewCharacters("🎉ab")).toBe(3)
    expect(countReviewCodePoints("🎉ab")).toBe(3)
  })

  it("leaves zero-width padding out of the minimum, but not the maximum", () => {
    expect(countReviewCharacters("ab​​")).toBe(2)
    expect(countReviewCodePoints("ab​​")).toBe(4)
  })
})
