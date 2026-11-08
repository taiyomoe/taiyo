import * as stylex from "@stylexjs/stylex"
import { CheckCircle, Package } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ShopItem } from "@/features/shop/api/shop"
import { PointsAmount } from "@/features/shop/components/points-amount"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  note: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.75rem",
  },
})

export function ItemAction({
  item,
  balance,
  equipped,
  equipping,
  onBuy,
  onEquip,
}: {
  item: ShopItem
  balance: number
  equipped: boolean
  equipping: boolean
  onBuy: () => void
  onEquip: () => void
}) {
  const { unlock } = item

  if (item.unlocked) {
    return (
      <>
        <span sx={styles.note}>
          <CheckCircle size={14} />
          {equipped ? m.shop_equipped() : m.shop_owned()}
        </span>
        {equipped ? null : (
          <Button loading={equipping} onClick={onEquip} size="sm" variant="outline">
            {m.shop_equip()}
          </Button>
        )}
      </>
    )
  }

  if (unlock.type !== "shop") {
    return (
      <span sx={styles.note}>
        <Package size={14} />
        {m.profile_unlock_loot_box()}
      </span>
    )
  }

  const affordable = balance >= unlock.price

  return (
    <>
      <PointsAmount points={unlock.price} />
      <Button
        disabled={!affordable}
        onClick={onBuy}
        size="sm"
        title={affordable ? undefined : m.shop_not_enough()}
      >
        {m.shop_buy()}
      </Button>
    </>
  )
}
