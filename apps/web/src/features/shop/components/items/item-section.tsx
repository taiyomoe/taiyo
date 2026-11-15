import type { CosmeticKind } from "@taiyomoe/db/cosmetics"
import * as stylex from "@stylexjs/stylex"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { Shop, ShopItem } from "@/features/shop/api/shop"
import type { ShopViewer } from "@/features/shop/components/items/item-preview"
import { ItemCard } from "@/features/shop/components/items/item-card"
import { PurchaseDialog } from "@/features/shop/components/items/purchase-dialog"
import { toEquipPatch } from "@/features/shop/lib/equip-patch"
import { useEquipCosmetics } from "@/features/users/api/profile"
import { getCosmeticLabel } from "@/features/users/lib/cosmetic-labels"
import { m } from "@/paraglide/messages"

const TABS: ReadonlyArray<{ kind: CosmeticKind; label: () => string }> = [
  { kind: "AVATAR_BORDER", label: m.shop_section_borders },
  { kind: "NAME_EFFECT", label: m.shop_section_effects },
  { kind: "TITLE", label: m.shop_section_titles },
]
const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3 } as const
const styles = stylex.create({
  tabs: {
    gap: "1.25rem",
  },
  grid: {
    gap: "0.875rem",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [breakpoints.md]: {
        default: "repeat(3, minmax(0, 1fr))",
        [breakpoints.xl]: "repeat(4, minmax(0, 1fr))",
      },
    },
  },
})
const sortItems = (items: ShopItem[]) =>
  [...items].sort((a, b) => {
    const priceA = a.unlock.type === "shop" ? a.unlock.price : Number.POSITIVE_INFINITY
    const priceB = b.unlock.type === "shop" ? b.unlock.price : Number.POSITIVE_INFINITY

    return priceA - priceB || RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]
  })

export function ItemSection({
  shop,
  viewer,
  username,
}: {
  shop: Shop
  viewer: ShopViewer
  username: string
}) {
  const equip = useEquipCosmetics(username)
  const [buying, setBuying] = useState<ShopItem | null>(null)
  const equippedKey: Record<CosmeticKind, string | null> = {
    AVATAR_BORDER: shop.equipped.avatarBorder,
    NAME_EFFECT: shop.equipped.nameEffect,
    TITLE: shop.equipped.title,
  }
  const listed = shop.items.filter(
    (item) => item.unlock.type === "shop" || item.unlock.type === "lootBox",
  )

  return (
    <>
      <Tabs defaultValue="AVATAR_BORDER" sx={styles.tabs}>
        <TabsList variant="underline">
          {TABS.map((tab) => (
            <TabsTab key={tab.kind} value={tab.kind}>
              {tab.label()}
            </TabsTab>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsPanel key={tab.kind} value={tab.kind}>
            <div sx={styles.grid}>
              {sortItems(listed.filter((item) => item.kind === tab.kind)).map((item) => (
                <ItemCard
                  key={item.key}
                  balance={shop.balance}
                  equipped={equippedKey[item.kind] === item.key}
                  equipping={
                    equip.isPending &&
                    Object.values(equip.variables).some((value) => value === item.key)
                  }
                  item={item}
                  onBuy={() => {
                    setBuying(item)
                  }}
                  onEquip={() => {
                    const patch = toEquipPatch(item.kind, item.key)

                    if (patch === null) {
                      return
                    }

                    equip.mutate(patch, {
                      onSuccess: () => {
                        toastManager.add({
                          title: m.shop_equipped_toast({
                            name: getCosmeticLabel(item.kind, item.key),
                          }),
                          type: "success",
                        })
                      },
                    })
                  }}
                  viewer={viewer}
                />
              ))}
            </div>
          </TabsPanel>
        ))}
      </Tabs>
      {buying !== null && buying.unlock.type === "shop" ? (
        <PurchaseDialog
          balance={shop.balance}
          item={buying}
          onClose={() => {
            setBuying(null)
          }}
          price={buying.unlock.price}
          viewer={viewer}
        />
      ) : null}
    </>
  )
}
