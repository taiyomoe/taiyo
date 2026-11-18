import { describe, expect, it } from "vitest"
import { ACHIEVEMENT_KEYS, ACHIEVEMENTS } from "../achievements"
import { COSMETIC_CATALOG, COSMETIC_KINDS } from "../cosmetics"

const unlockedBy = (key: string) =>
  COSMETIC_KINDS.flatMap((kind) =>
    Object.entries(COSMETIC_CATALOG[kind]).flatMap(([cosmetic, { unlock }]) =>
      unlock.type === "achievement" && unlock.achievement === key ? [{ kind, key: cosmetic }] : [],
    ),
  )

describe("ACHIEVEMENTS", () => {
  it("lists exactly the cosmetics that unlock with each achievement", () => {
    for (const key of ACHIEVEMENT_KEYS) {
      expect([...(ACHIEVEMENTS[key].rewards.cosmetics ?? [])]).toEqual(unlockedBy(key))
    }
  })

  it("has one metric achievement per metric and threshold", () => {
    const thresholds = ACHIEVEMENT_KEYS.flatMap((key) => {
      const { criteria } = ACHIEVEMENTS[key]

      return criteria.type === "metric" ? [`${criteria.metric}:${criteria.threshold}`] : []
    })

    expect(new Set(thresholds).size).toBe(thresholds.length)
  })
})
