import * as stylex from "@stylexjs/stylex"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { PointsAmount } from "@/features/shop/components/points-amount"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  header: {
    gap: "1.25rem",
    alignItems: { default: "flex-start", [breakpoints.md]: "flex-end" },
    display: "flex",
    flexDirection: { default: "column", [breakpoints.md]: "row" },
    justifyContent: "space-between",
  },
  text: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "40rem",
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    lineHeight: 1.5,
  },
  balance: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.25rem",
    paddingBlock: "0.75rem",
    paddingInline: "1.125rem",
    backgroundColor: colors.card,
    backgroundImage:
      "radial-gradient(120% 140% at 100% 0%, rgb(245 158 11 / 14%), transparent 60%)",
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  points: {
    fontSize: "1.5rem",
  },
  hint: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
})

export function ShopHeader({ balance }: { balance: number }) {
  return (
    <header sx={styles.header}>
      <div sx={styles.text}>
        <h1 sx={styles.heading}>{m.shop_title()}</h1>
        <p sx={styles.description}>{m.shop_description()}</p>
      </div>
      <div aria-live="polite" sx={styles.balance}>
        <span sx={styles.label}>{m.shop_balance_label()}</span>
        <PointsAmount points={balance} size={22} sx={styles.points} />
        <span sx={styles.hint}>{m.shop_earn_hint({ pages: 20 })}</span>
      </div>
    </header>
  )
}
