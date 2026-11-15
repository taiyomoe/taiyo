import * as stylex from "@stylexjs/stylex"
import { consts, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { LootBoxOpening } from "@/features/shop/api/shop"
import { ItemPreview, type ShopViewer } from "@/features/shop/components/items/item-preview"
import { RARITY_COLORS } from "@/features/shop/lib/rarity-colors"
import {
  COSMETIC_KIND_LABELS,
  getCosmeticLabel,
  RARITY_LABELS,
} from "@/features/users/lib/cosmetic-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const emerge = stylex.keyframes({
  "0%": { filter: "blur(14px)", opacity: 0, transform: "translateY(90px) scale(0.6)" },
  "55%": { filter: "blur(0)", opacity: 1, transform: "translateY(-10px) scale(1.04)" },
  "100%": { filter: "blur(0)", opacity: 1, transform: "translateY(0) scale(1)" },
})
const hover = stylex.keyframes({
  "0%, 100%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-6px)" },
})
const fade = stylex.keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
})
const styles = stylex.create({
  wrap: {
    animationDuration: { default: "900ms", [consts.reducedMotion]: "1ms" },
    animationFillMode: "both",
    animationName: emerge,
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  card: (glow: string) => ({
    borderColor: `color-mix(in srgb, ${glow} 45%, rgb(255 255 255 / 10%))`,
    borderRadius: radius.xxxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1rem",
    paddingBlock: "1.75rem 1.5rem",
    paddingInline: "2.25rem",
    alignItems: "center",
    animationDelay: "900ms",
    animationDuration: "4s",
    animationIterationCount: "infinite",
    animationName: { default: hover, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-in-out",
    backdropFilter: "blur(24px) saturate(150%)",
    backgroundColor: "rgb(8 8 12 / 82%)",
    backgroundImage: `radial-gradient(100% 70% at 50% 0%, color-mix(in srgb, ${glow} 26%, transparent), transparent 70%)`,
    boxShadow: `inset 0 1px 0 rgb(255 255 255 / 10%), 0 0 0 1px rgb(0 0 0 / 40%), 0 30px 80px -20px color-mix(in srgb, ${glow} 55%, transparent)`,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    maxWidth: "calc(100vw - 2.5rem)",
    minWidth: "17rem",
  }),
  rarity: (glow: string) => ({
    color: glow,
    fontSize: "0.6875rem",
    fontWeight: 800,
    letterSpacing: "0.22em",
    textShadow: `0 0 16px ${glow}`,
    textTransform: "uppercase",
  }),
  preview: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    maxWidth: "100%",
    minHeight: "7rem",
  },
  name: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
  },
  meta: {
    color: "rgb(255 255 255 / 55%)",
    fontSize: "0.8125rem",
  },
  status: {
    animationDelay: "500ms",
    animationDuration: "500ms",
    animationFillMode: "both",
    animationName: fade,
    color: "rgb(255 255 255 / 65%)",
    fontSize: "0.8125rem",
    fontWeight: 600,
  },
})

export function RevealCard({ opening, viewer }: { opening: LootBoxOpening; viewer: ShopViewer }) {
  const glow = RARITY_COLORS[opening.item.rarity].main

  return (
    <div sx={styles.wrap}>
      <div sx={styles.card(glow)}>
        <span sx={styles.rarity(glow)}>
          {RARITY_LABELS[opening.item.rarity]()}
          {opening.duplicate ? "" : ` · ${m.shop_opening_new()}`}
        </span>
        <div sx={styles.preview}>
          <ItemPreview
            itemKey={opening.item.key}
            kind={opening.item.kind}
            size="6rem"
            viewer={viewer}
          />
        </div>
        <div>
          <p sx={styles.name}>{getCosmeticLabel(opening.item.kind, opening.item.key)}</p>
          <span sx={styles.meta}>{COSMETIC_KIND_LABELS[opening.item.kind]()}</span>
        </div>
        {opening.duplicate ? (
          <span sx={styles.status}>
            {m.shop_opening_duplicate({ refund: opening.refund.toLocaleString(getLocale()) })}
          </span>
        ) : null}
      </div>
    </div>
  )
}
