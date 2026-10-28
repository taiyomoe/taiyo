import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"

export const paginationStyles = stylex.create({
  page: {
    paddingInline: "0.375rem",
    fontVariantNumeric: "tabular-nums",
    height: { default: null, [breakpoints.maxSm]: "2rem" },
    minWidth: { default: "2.25rem", [breakpoints.maxSm]: "2rem" },
    width: "auto",
  },
})
