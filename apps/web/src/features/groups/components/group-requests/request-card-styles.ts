import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const requestCardStyles = stylex.create({
  card: {
    padding: "1.5rem",
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1.25rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
  top: {
    gap: "0.875rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  target: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  targetName: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontSize: "1.125rem",
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  time: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  quote: {
    margin: 0,
    padding: "1rem",
    borderRadius: `calc(${radius.xxl} - 0.75rem)`,
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 3%, transparent)`,
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  warning: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.warning,
    display: "flex",
    fontSize: "0.875rem",
  },
})
