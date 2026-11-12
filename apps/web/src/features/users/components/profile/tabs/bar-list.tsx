import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, font, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.75rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
  },
  head: {
    gap: "0.75rem",
    alignItems: "baseline",
    display: "flex",
    fontSize: "0.875rem",
    justifyContent: "space-between",
  },
  label: {
    gap: "0.5rem",
    overflow: "hidden",
    alignItems: "center",
    display: "flex",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  value: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  track: {
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 6%, transparent)`,
    height: "0.5rem",
  },
  fill: {
    borderRadius: 4,
    backgroundColor: colors.primary,
    transformOrigin: "left",
    transitionDuration: motion.enterLarge,
    transitionProperty: "width",
    transitionTimingFunction: motion.easeOut,
    height: "100%",
  },
  muted: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 35%, transparent)`,
  },
})

export type BarListItem = { key: string; label: ReactNode; value: number; title: string }

/**
 * Magnitudes as labelled horizontal bars in one hue: the label and the number
 * carry identity, so the bars never need a legend.
 */
export function BarList({ items, total }: { items: BarListItem[]; total?: number }) {
  const max = Math.max(1, ...items.map((item) => item.value))
  const sum = total ?? items.reduce((acc, item) => acc + item.value, 0)

  return (
    <ul sx={styles.list}>
      {items.map((item) => (
        <li key={item.key} sx={styles.row} title={item.title}>
          <div sx={styles.head}>
            <span sx={styles.label}>{item.label}</span>
            <span sx={styles.value}>
              {item.value.toLocaleString(getLocale())}
              {sum > 0 ? ` · ${Math.round((item.value / sum) * 100)}%` : ""}
            </span>
          </div>
          <div aria-hidden sx={styles.track}>
            <div
              style={{ width: `${(item.value / max) * 100}%` }}
              sx={[styles.fill, item.value === 0 && styles.muted]}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
