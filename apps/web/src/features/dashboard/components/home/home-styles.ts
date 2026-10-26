import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const homeStyles = stylex.create({
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  grid: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
  },
  icon: {
    borderRadius: radius.lg,
    alignItems: "center",
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "2.25rem",
    width: "2.25rem",
  },
  stats: {
    margin: 0,
    gap: "0.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  stat: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column-reverse",
    minWidth: 0,
  },
  statValue: {
    margin: 0,
    fontSize: "1.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  statLabel: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})
