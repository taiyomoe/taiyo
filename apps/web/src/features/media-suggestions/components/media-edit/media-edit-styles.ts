import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const mediaEditStyles = stylex.create({
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
})
