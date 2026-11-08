import * as stylex from "@stylexjs/stylex"
import { colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ShopItem } from "@/features/shop/api/shop"
import { ItemAction } from "@/features/shop/components/items/item-action"
import { ItemPreview, type ShopViewer } from "@/features/shop/components/items/item-preview"
import { RARITY_COLORS } from "@/features/shop/lib/rarity-colors"
import { RARITY_STYLES } from "@/features/users/components/profile/rarity-styles"
import { getCosmeticLabel, RARITY_LABELS } from "@/features/users/lib/cosmetic-labels"

const styles = stylex.create({
  card: {
    padding: "0.5rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
    transitionDuration: motion.enter,
    transitionProperty: "border-color",
  },
  equipped: {
    borderColor: `color-mix(in srgb, ${colors.primary} 60%, transparent)`,
  },
  preview: (glow: string) => ({
    borderRadius: `calc(${radius.xl} - 0.5rem - 1px)`,
    overflow: "hidden",
    paddingBlock: "1.5rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    backgroundColor: colors.well,
    backgroundImage: `radial-gradient(70% 80% at 50% 100%, color-mix(in srgb, ${glow} 14%, transparent), transparent 70%)`,
    display: "flex",
    justifyContent: "center",
    minHeight: "7.5rem",
  }),
  body: {
    gap: "0.5rem",
    paddingInline: "0.375rem",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "0.25rem",
  },
  heading: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    minWidth: 0,
  },
  name: {
    margin: 0,
    overflow: "hidden",
    fontSize: "0.9375rem",
    fontWeight: font.weightBold,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rarity: {
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingInline: "0.375rem",
    flexShrink: 0,
    fontSize: "0.625rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    lineHeight: "1rem",
    textTransform: "uppercase",
  },
  footer: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    minHeight: "2rem",
  },
})

export function ItemCard({
  item,
  viewer,
  balance,
  equipped,
  equipping,
  onBuy,
  onEquip,
}: {
  item: ShopItem
  viewer: ShopViewer
  balance: number
  equipped: boolean
  equipping: boolean
  onBuy: () => void
  onEquip: () => void
}) {
  return (
    <article sx={[styles.card, equipped && styles.equipped]}>
      <div sx={styles.preview(RARITY_COLORS[item.rarity].main)}>
        <ItemPreview itemKey={item.key} kind={item.kind} viewer={viewer} />
      </div>
      <div sx={styles.body}>
        <div sx={styles.heading}>
          <h3 sx={styles.name}>{getCosmeticLabel(item.kind, item.key)}</h3>
          <span sx={[styles.rarity, RARITY_STYLES[item.rarity]]}>
            {RARITY_LABELS[item.rarity]()}
          </span>
        </div>
        <div sx={styles.footer}>
          <ItemAction
            balance={balance}
            equipped={equipped}
            equipping={equipping}
            item={item}
            onBuy={onBuy}
            onEquip={onEquip}
          />
        </div>
      </div>
    </article>
  )
}
