import { describe, expect, test } from "vitest"
import { config } from "../index"
import { getRatingAverage, getRatingScore } from "../ratings"

const prior = { priorWeight: 25, priorMean: 7 }

describe("getRatingAverage", () => {
  test("is null without ratings", () => {
    expect(getRatingAverage({ count: 0, sum: 0 })).toBeNull()
  })

  test("divides the sum by the count", () => {
    expect(getRatingAverage({ count: 4, sum: 30 })).toBe(7.5)
  })
})

describe("getRatingScore", () => {
  test("is the prior mean without ratings", () => {
    expect(getRatingScore({ count: 0, sum: 0 }, prior)).toBe(7)
  })

  test("moves toward the title's own average as ratings accumulate", () => {
    const few = getRatingScore({ count: 2, sum: 20 }, prior)
    const many = getRatingScore({ count: 2000, sum: 20_000 }, prior)

    expect(few).toBeGreaterThan(7)
    expect(few).toBeLessThan(7.3)
    expect(many).toBeGreaterThan(9.9)
  })

  test("ranks a widely rated title above one with two perfect scores", () => {
    const twoTens = getRatingScore({ count: 2, sum: 20 }, prior)
    const popular = getRatingScore({ count: 5000, sum: 5000 * 8.9 }, prior)

    expect(popular).toBeGreaterThan(twoTens)
  })

  test("stays within the score range with the configured prior", () => {
    const { minScore, maxScore } = config.ratings

    expect(
      getRatingScore({ count: 100, sum: 100 * minScore }, config.ratings),
    ).toBeGreaterThanOrEqual(minScore)
    expect(getRatingScore({ count: 100, sum: 100 * maxScore }, config.ratings)).toBeLessThanOrEqual(
      maxScore,
    )
  })
})
