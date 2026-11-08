import {
  COSMETIC_CATALOG,
  COSMETIC_KINDS,
  COSMETIC_RARITIES,
  type CosmeticKind,
  type CosmeticRarity,
} from "./cosmetics"

export const LOOT_BOX_KEYS = ["iron", "gold", "diamond", "mythic"] as const

export type LootBoxKey = (typeof LOOT_BOX_KEYS)[number]

export type LootBoxDefinition = {
  price: number
  duplicateRefund: number
  weights: Record<CosmeticRarity, number>
}

export const LOOT_BOXES: Record<LootBoxKey, LootBoxDefinition> = {
  iron: {
    price: 300,
    duplicateRefund: 120,
    weights: { common: 62, rare: 30, epic: 7, legendary: 1 },
  },
  gold: {
    price: 750,
    duplicateRefund: 300,
    weights: { common: 25, rare: 45, epic: 24, legendary: 6 },
  },
  diamond: {
    price: 1600,
    duplicateRefund: 640,
    weights: { common: 0, rare: 35, epic: 45, legendary: 20 },
  },
  mythic: {
    price: 3000,
    duplicateRefund: 1200,
    weights: { common: 0, rare: 0, epic: 50, legendary: 50 },
  },
}

export const isLootBoxKey = (value: unknown): value is LootBoxKey =>
  LOOT_BOX_KEYS.some((key) => key === value)

export type LootBoxItem = { kind: CosmeticKind; key: string; rarity: CosmeticRarity }

export const LOOT_BOX_POOL: readonly LootBoxItem[] = COSMETIC_KINDS.flatMap((kind) =>
  Object.entries(COSMETIC_CATALOG[kind])
    .filter(
      ([, definition]) => definition.unlock.type === "shop" || definition.unlock.type === "lootBox",
    )
    .map(([key, definition]) => ({ kind, key, rarity: definition.rarity })),
)

export const getLootBoxOdds = (box: LootBoxKey) => {
  const { weights } = LOOT_BOXES[box]
  const stocked = COSMETIC_RARITIES.filter(
    (rarity) => weights[rarity] > 0 && LOOT_BOX_POOL.some((item) => item.rarity === rarity),
  )
  const total = stocked.reduce((sum, rarity) => sum + weights[rarity], 0)

  return stocked.map((rarity) => ({
    rarity,
    weight: weights[rarity],
    chance: weights[rarity] / total,
    items: LOOT_BOX_POOL.filter((item) => item.rarity === rarity),
  }))
}

export const rollLootBox = (box: LootBoxKey, random: (max: number) => number) => {
  const odds = getLootBoxOdds(box)
  const total = odds.reduce((sum, entry) => sum + entry.weight, 0)
  let ticket = random(total)

  for (const entry of odds) {
    if (ticket < entry.weight) {
      const item = entry.items[random(entry.items.length)]

      if (item === undefined) {
        break
      }

      return item
    }

    ticket -= entry.weight
  }

  throw new Error(`Loot box ${box} has an empty pool`)
}
