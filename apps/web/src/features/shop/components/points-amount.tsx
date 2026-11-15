import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Coins } from "@taiyomoe/ui/components/icons"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  amount: {
    gap: "0.3125rem",
    alignItems: "center",
    display: "inline-flex",
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 650,
  },
  icon: {
    color: "#f59e0b",
    flexShrink: 0,
  },
})

export function PointsAmount({
  points,
  size = 15,
  sx,
}: {
  points: number
  size?: number
  sx?: Sx
}) {
  return (
    <span sx={[styles.amount, sx]}>
      <Coins size={size} sx={styles.icon} />
      {points.toLocaleString(getLocale())}
    </span>
  )
}
