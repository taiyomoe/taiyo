import { describe, expect, test } from "vitest"
import { getRatingDelta } from "../ratings"

const counts = (changes: Record<number, number>) =>
  Array.from({ length: 10 }, (_, index) => changes[index + 1] ?? 0)

describe("getRatingDelta", () => {
  test("adds a new rating", () => {
    expect(getRatingDelta(null, 8)).toEqual({ count: 1, sum: 8, scoreCounts: counts({ 8: 1 }) })
  })

  test("moves a changed score without changing the count", () => {
    expect(getRatingDelta(3, 9)).toEqual({ count: 0, sum: 6, scoreCounts: counts({ 3: -1, 9: 1 }) })
    expect(getRatingDelta(9, 3)).toEqual({
      count: 0,
      sum: -6,
      scoreCounts: counts({ 3: 1, 9: -1 }),
    })
  })

  test("changes nothing when the score stays the same", () => {
    expect(getRatingDelta(5, 5)).toEqual({ count: 0, sum: 0, scoreCounts: counts({}) })
  })

  test("removes a rating", () => {
    expect(getRatingDelta(10, null)).toEqual({
      count: -1,
      sum: -10,
      scoreCounts: counts({ 10: -1 }),
    })
  })

  test("undoes itself when applied backwards", () => {
    for (const [from, to] of [
      [null, 1],
      [4, 7],
      [10, null],
    ] as const) {
      const forward = getRatingDelta(from, to)
      const backward = getRatingDelta(to, from)

      expect(forward.count + backward.count).toBe(0)
      expect(forward.sum + backward.sum).toBe(0)
      expect(
        forward.scoreCounts.map((value, index) => value + (backward.scoreCounts[index] ?? 0)),
      ).toEqual(counts({}))
    }
  })
})
