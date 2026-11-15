import type { CosmeticKind } from "../cosmetics"
import type { Generated, Timestamp } from "../types"

type ShopPurchaseType = "ITEM" | "LOOT_BOX"

export type ShopPurchase = {
  id: Generated<string>
  userId: string
  type: ShopPurchaseType
  lootBox: string | null
  cosmeticKind: CosmeticKind
  cosmeticKey: string
  price: number
  refund: Generated<number>
  duplicate: Generated<boolean>
  createdAt: Generated<Timestamp>
}
