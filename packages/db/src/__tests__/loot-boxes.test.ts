import { describe, expect, test } from "vitest"
import { getCosmeticDefinition } from "../cosmetics"
import {
  getLootBoxOdds,
  LOOT_BOX_KEYS,
  LOOT_BOX_POOL,
  LOOT_BOXES,
  rollLootBox,
} from "../loot-boxes"

describe("loot boxes", () => {
  test("only pool shop and box-exclusive items", () => {
    for (const item of LOOT_BOX_POOL) {
      expect(["shop", "lootBox"]).toContain(getCosmeticDefinition(item.kind, item.key)?.unlock.type)
    }
  })

  test.each(LOOT_BOX_KEYS)("%s odds sum to 1 and refund less than the price", (box) => {
    const odds = getLootBoxOdds(box)

    expect(odds.reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(1, 12)
    expect(LOOT_BOXES[box].duplicateRefund).toBeLessThan(LOOT_BOXES[box].price)
  })

  test.each(LOOT_BOX_KEYS)("%s rolls every ticket into its pool", (box) => {
    const odds = getLootBoxOdds(box)
    const total = odds.reduce((sum, entry) => sum + entry.weight, 0)
    const counts = new Map<string, number>()

    for (let ticket = 0; ticket < total; ticket += 1) {
      const item = rollLootBox(box, (max) => (max === total ? ticket : 0))

      expect(LOOT_BOXES[box].weights[item.rarity]).toBeGreaterThan(0)
      counts.set(item.rarity, (counts.get(item.rarity) ?? 0) + 1)
    }

    for (const entry of odds) {
      expect(counts.get(entry.rarity)).toBe(entry.weight)
    }
  })

  test("reaches every item of a rarity", () => {
    const [legendary] = getLootBoxOdds("mythic").filter((entry) => entry.rarity === "legendary")
    const seen = new Set<string>()

    if (legendary === undefined) {
      throw new Error("Expected legendary odds")
    }

    for (let index = 0; index < legendary.items.length; index += 1) {
      const item = rollLootBox("mythic", (max) => (max === legendary.items.length ? index : 99))

      seen.add(`${item.kind}:${item.key}`)
    }

    expect(seen.size).toBe(legendary.items.length)
  })

  test("never resolves prototype keys", () => {
    expect(getCosmeticDefinition("AVATAR_BORDER", "__proto__")).toBeUndefined()
    expect(getCosmeticDefinition("TITLE", "constructor")).toBeUndefined()
  })
})
