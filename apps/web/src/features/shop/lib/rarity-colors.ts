import type { CosmeticRarity } from "@taiyomoe/db/cosmetics"

export const RARITY_COLORS: Record<CosmeticRarity, { main: string; light: string; deep: string }> =
  {
    common: { main: "#a1a1aa", light: "#f4f4f5", deep: "#52525b" },
    rare: { main: "#0ea5e9", light: "#bae6fd", deep: "#075985" },
    epic: { main: "#a855f7", light: "#e9d5ff", deep: "#581c87" },
    legendary: { main: "#f59e0b", light: "#fef3c7", deep: "#92400e" },
  }
