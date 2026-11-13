import type { LootBoxKey } from "@taiyomoe/db/loot-boxes"
import * as stylex from "@stylexjs/stylex"
import { colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ShopLootBox } from "@/features/shop/api/shop"
import { TIER_LABELS } from "@/features/shop/lib/tier-labels"
import { CHEST_PALETTES } from "@/features/shop/scene/chest-palettes"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  group: {
    padding: "0.3125rem",
    borderColor: "rgb(255 255 255 / 8%)",
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.25rem",
    backdropFilter: "blur(14px)",
    backgroundColor: "rgb(10 10 14 / 62%)",
    display: "inline-flex",
    maxWidth: "100%",
    overflowX: "auto",
  },
  tier: {
    borderRadius: radius.full,
    borderStyle: "none",
    gap: "0.625rem",
    paddingBlock: "0.5rem",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": "rgb(255 255 255 / 5%)",
    },
    color: {
      default: "rgb(255 255 255 / 62%)",
      ":hover": "rgb(255 255 255 / 85%)",
    },
    cursor: "pointer",
    display: "flex",
    flexShrink: 0,
    fontFamily: "inherit",
    fontSize: "0.875rem",
    fontWeight: 600,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    paddingInlineEnd: "1rem",
    paddingInlineStart: "0.875rem",
    transitionDuration: motion.enter,
    transitionProperty: "background-color, color, box-shadow",
  },
  selected: {
    backgroundColor: { default: "rgb(255 255 255 / 10%)", ":hover": "rgb(255 255 255 / 12%)" },
    boxShadow: "inset 0 1px 0 rgb(255 255 255 / 10%), 0 6px 18px -8px rgb(0 0 0 / 80%)",
    color: { default: "white", ":hover": "white" },
  },
  gem: (color: string) => ({
    borderRadius: 2,
    backgroundColor: color,
    boxShadow: `0 0 10px ${color}`,
    flexShrink: 0,
    transform: "rotate(45deg)",
    height: "0.5rem",
    width: "0.5rem",
  }),
  price: {
    color: "rgb(255 255 255 / 45%)",
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
})

export function TierPicker({
  boxes,
  selected,
  onSelect,
}: {
  boxes: readonly ShopLootBox[]
  selected: LootBoxKey
  onSelect: (box: LootBoxKey) => void
}) {
  return (
    <div aria-label={m.shop_treasury_pick()} role="radiogroup" sx={styles.group}>
      {boxes.map((box) => (
        <button
          key={box.key}
          aria-checked={box.key === selected}
          onClick={() => {
            onSelect(box.key)
          }}
          role="radio"
          sx={[styles.tier, box.key === selected && styles.selected]}
          type="button"
        >
          <span aria-hidden sx={styles.gem(CHEST_PALETTES[box.key].glow)} />
          {TIER_LABELS[box.key].name()}
          <span sx={styles.price}>{box.price.toLocaleString(getLocale())}</span>
        </button>
      ))}
    </div>
  )
}
