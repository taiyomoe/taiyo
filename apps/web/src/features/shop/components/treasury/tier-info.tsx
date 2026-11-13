import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ShopLootBox } from "@/features/shop/api/shop"
import { sceneFont } from "@/components/scene/scene.stylex"
import { PointsAmount } from "@/features/shop/components/points-amount"
import { TIER_LABELS } from "@/features/shop/lib/tier-labels"
import { CHEST_PALETTES } from "@/features/shop/scene/chest-palettes"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  info: {
    gap: "0.875rem",
    color: "white",
    display: "flex",
    flexDirection: "column",
    maxWidth: "19rem",
  },
  eyebrow: (glow: string) => ({
    color: glow,
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textShadow: `0 0 14px ${glow}`,
    textTransform: "uppercase",
  }),
  name: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "2rem", [breakpoints.lg]: "2.75rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.05,
  },
  tagline: {
    margin: 0,
    color: "rgb(255 255 255 / 62%)",
    fontSize: "0.9375rem",
    lineHeight: 1.5,
  },
  actions: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    marginTop: "0.5rem",
  },
  price: {
    fontSize: "1.375rem",
  },
  hint: {
    color: "rgb(255 255 255 / 50%)",
    fontSize: "0.75rem",
    width: "100%",
  },
})

export function TierInfo({
  box,
  index,
  total,
  balance,
  onOpen,
}: {
  box: ShopLootBox
  index: number
  total: number
  balance: number
  onOpen: () => void
}) {
  const exhausted = box.owned >= box.total
  const short = box.price - balance
  const labels = TIER_LABELS[box.key]

  return (
    <div sx={styles.info}>
      <span sx={styles.eyebrow(CHEST_PALETTES[box.key].glow)}>
        {m.shop_treasury_eyebrow({ tier: index + 1, total })}
      </span>
      <h2 sx={styles.name}>{labels.name()}</h2>
      <p sx={styles.tagline}>{labels.tagline()}</p>
      <div sx={styles.actions}>
        <PointsAmount points={box.price} size={20} sx={styles.price} />
        <Button disabled={exhausted || short > 0} onClick={onOpen} size="lg">
          {m.shop_box_open_chest()}
        </Button>
        {short > 0 && !exhausted ? (
          <span sx={styles.hint}>
            {m.shop_box_short({ needed: short.toLocaleString(getLocale()) })}
          </span>
        ) : null}
      </div>
    </div>
  )
}
