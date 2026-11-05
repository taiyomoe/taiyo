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
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "dashed",
    borderWidth: 1,
    paddingBlock: "0.875rem",
    paddingInline: "1.25rem",
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
})
