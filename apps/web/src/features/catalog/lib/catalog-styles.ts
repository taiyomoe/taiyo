import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"

export const catalogStyles = stylex.create({
  colMedia: { width: "auto" },
  colNarrow: { width: "6.5rem" },
  colMedium: { width: "9rem" },
  colWide: { width: "12rem" },
  colActions: { width: "3.5rem" },
  numeric: {
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
  },
  muted: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  inline: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
})
