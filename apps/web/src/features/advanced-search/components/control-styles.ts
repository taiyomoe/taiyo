import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"

export const controlStyles = stylex.create({
  height: {
    height: {
      default: "2.75rem",
      [breakpoints.sm]: "2.5rem",
    },
  },
})
