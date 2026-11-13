import * as stylex from "@stylexjs/stylex"
import { font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ShopLootBox } from "@/features/shop/api/shop"
import { RARITY_COLORS } from "@/features/shop/lib/rarity-colors"
import { RARITY_LABELS } from "@/features/users/lib/cosmetic-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  panel: {
    padding: "1.125rem",
    borderColor: "rgb(255 255 255 / 8%)",
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.875rem",
    backdropFilter: "blur(16px)",
    backgroundColor: "rgb(10 10 14 / 58%)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  title: {
    margin: 0,
    color: "rgb(255 255 255 / 55%)",
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "0.375rem",
    display: "grid",
    fontSize: "0.8125rem",
    gridTemplateColumns: "1fr auto",
  },
  label: {
    fontWeight: 600,
  },
  chance: {
    color: "rgb(255 255 255 / 70%)",
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
  },
  track: {
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: "rgb(255 255 255 / 7%)",
    gridColumnEnd: -1,
    gridColumnStart: 1,
    height: "0.25rem",
  },
  fill: (color: string, share: number) => ({
    borderRadius: radius.full,
    backgroundColor: color,
    boxShadow: `0 0 10px ${color}`,
    height: "100%",
    width: `${Math.max(2, share * 100)}%`,
  }),
  footer: {
    gap: "0.25rem",
    color: "rgb(255 255 255 / 55%)",
    display: "flex",
    flexDirection: "column",
    fontSize: "0.75rem",
    borderTopColor: "rgb(255 255 255 / 8%)",
    borderTopStyle: "solid",
    borderTopWidth: 1,
    paddingTop: "0.75rem",
  },
})
const formatChance = (chance: number) =>
  new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: chance < 0.1 ? 1 : 0,
  }).format(chance)

export function LootBoxOdds({ box }: { box: ShopLootBox }) {
  const exhausted = box.owned >= box.total

  return (
    <div sx={styles.panel}>
      <h3 sx={styles.title}>{m.shop_box_odds()}</h3>
      <ul sx={styles.list}>
        {box.odds.map((entry) => (
          <li key={entry.rarity} sx={styles.row}>
            <span sx={styles.label}>{RARITY_LABELS[entry.rarity]()}</span>
            <span sx={styles.chance}>{formatChance(entry.chance)}</span>
            <span aria-hidden sx={styles.track}>
              <span sx={styles.fill(RARITY_COLORS[entry.rarity].main, entry.chance)} />
            </span>
          </li>
        ))}
      </ul>
      <div sx={styles.footer}>
        <span>
          {exhausted
            ? m.shop_box_exhausted()
            : m.shop_box_collected({ owned: box.owned, total: box.total })}
        </span>
        <span>
          {m.shop_box_duplicate_refund({ refund: box.duplicateRefund.toLocaleString(getLocale()) })}
        </span>
      </div>
    </div>
  )
}
