import type { LootBoxKey } from "@taiyomoe/db/loot-boxes"
import { m } from "@/paraglide/messages"

export const TIER_LABELS: Record<LootBoxKey, { name: () => string; tagline: () => string }> = {
  iron: { name: m.loot_box_iron, tagline: m.loot_box_iron_tagline },
  gold: { name: m.loot_box_gold, tagline: m.loot_box_gold_tagline },
  diamond: { name: m.loot_box_diamond, tagline: m.loot_box_diamond_tagline },
  mythic: { name: m.loot_box_mythic, tagline: m.loot_box_mythic_tagline },
}
