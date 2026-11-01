import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const groupStyles = stylex.create({
  column: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  note: {
    margin: 0,
    padding: "1rem",
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
  skeleton: {
    borderRadius: radius.xl,
    height: "4.5rem",
  },
})
