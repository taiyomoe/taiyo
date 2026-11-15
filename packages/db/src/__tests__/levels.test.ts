import { describe, expect, it } from "vitest"
import { getLevelCost, getLevelProgress } from "../levels"

describe("getLevelProgress", () => {
  it("starts everyone at level 1 as a newcomer", () => {
    expect(getLevelProgress(0)).toEqual({
      level: 1,
      xp: 0,
      levelXp: 0,
      levelCost: 250,
      rank: "newcomer",
      nextRank: { key: "pageTurner", level: 5 },
    })
  })

  it("levels up exactly at the cost of the current level", () => {
    expect(getLevelProgress(getLevelCost(1) - 1).level).toBe(1)
    expect(getLevelProgress(getLevelCost(1))).toMatchObject({ level: 2, levelXp: 0 })
  })

  it("keeps the rank of the highest bracket reached", () => {
    let xp = 0

    for (let level = 1; level < 10; level++) {
      xp += getLevelCost(level)
    }

    expect(getLevelProgress(xp)).toMatchObject({
      level: 10,
      rank: "apprentice",
      nextRank: { key: "adept", level: 20 },
    })
  })

  it("has no next rank past the last bracket and stops at the level cap", () => {
    const progress = getLevelProgress(Number.MAX_SAFE_INTEGER)

    expect(progress.level).toBe(999)
    expect(progress.rank).toBe("grandmaster")
    expect(progress.nextRank).toBeNull()
    expect(progress.levelXp).toBe(progress.levelCost)
  })

  it("makes every level cost more than the one before", () => {
    for (let level = 1; level < 100; level++) {
      expect(getLevelCost(level + 1)).toBeGreaterThan(getLevelCost(level))
    }
  })
})
