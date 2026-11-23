import { config } from "@taiyomoe/config"
import { describe, expect, test } from "vitest"
import { measureReviewBody } from "@/features/reviews/lib/review-body"

const { minBodyLength, maxBodyLength } = config.reviews

describe("measureReviewBody", () => {
  test("counts what is missing before the minimum", () => {
    expect(measureReviewBody("a".repeat(minBodyLength - 5))).toMatchObject({
      missing: 5,
      excess: 0,
      valid: false,
    })
  })

  test("accepts a body between the limits", () => {
    expect(measureReviewBody("a".repeat(minBodyLength))).toMatchObject({
      length: minBodyLength,
      missing: 0,
      valid: true,
    })
  })

  test("ignores the whitespace the server trims", () => {
    const body = `\n\n  ${"a".repeat(minBodyLength - 1)}   \n\n\n\n`

    expect(measureReviewBody(body)).toMatchObject({ missing: 1, valid: false })
  })

  test("does not count invisible padding toward the minimum", () => {
    expect(measureReviewBody(`${"a".repeat(minBodyLength - 1)}​​`).missing).toBe(1)
  })

  test("counts an emoji as one character", () => {
    expect(measureReviewBody("😀".repeat(maxBodyLength))).toMatchObject({
      length: maxBodyLength,
      valid: true,
    })
    expect(measureReviewBody("😀".repeat(maxBodyLength + 1))).toMatchObject({
      excess: 1,
      valid: false,
    })
  })
})
