import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"

export const detailStyles = stylex.create({
  field: {
    margin: 0,
    overflow: "hidden",
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    gridColumnEnd: "field",
    gridColumnStart: "field",
    gridRowEnd: "field",
    gridRowStart: "field",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  action: {
    color: colors.mutedForeground,
  },
})
