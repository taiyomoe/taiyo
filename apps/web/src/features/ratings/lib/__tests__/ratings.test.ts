import { describe, expect, test } from "vitest"
import type { MediaStats } from "@/features/ratings/api/ratings"
import { applyScoreChange, hasEnoughRatings } from "@/features/ratings/lib/ratings"

const getStats = (counts: Record<number, number>): MediaStats => {
  const distribution = Array.from({ length: 10 }, (_, index) => ({
    score: index + 1,
    count: counts[index + 1] ?? 0,
  }))
  const count = distribution.reduce((total, row) => total + row.count, 0)
  const sum = distribution.reduce((total, row) => total + row.score * row.count, 0)

  return {
    rating: { count, average: count === 0 ? null : sum / count, distribution },
    library: {
      total: 0,
      byStatus: { READING: 0, REREADING: 0, PLAN_TO_READ: 0, COMPLETED: 0, ON_HOLD: 0, DROPPED: 0 },
    },
  }
}

describe("applyScoreChange", () => {
  test("adds a first score", () => {
    expect(applyScoreChange(getStats({}), null, 7).rating).toEqual(getStats({ 7: 1 }).rating)
  })

  test("moves a changed score", () => {
    expect(applyScoreChange(getStats({ 4: 1, 8: 1 }), 4, 10).rating).toEqual(
      getStats({ 8: 1, 10: 1 }).rating,
    )
  })

  test("removes a score and leaves no average without ratings", () => {
    const { rating } = applyScoreChange(getStats({ 2: 1 }), 2, null)

    expect(rating.count).toBe(0)
    expect(rating.average).toBeNull()
  })

  test("undoes itself", () => {
    const stats = getStats({ 3: 2, 9: 5 })

    expect(applyScoreChange(applyScoreChange(stats, 3, 6), 6, 3)).toEqual(stats)
  })
})

describe("hasEnoughRatings", () => {
  test("needs the configured minimum", () => {
    expect(hasEnoughRatings(4)).toBe(false)
    expect(hasEnoughRatings(5)).toBe(true)
  })
})
