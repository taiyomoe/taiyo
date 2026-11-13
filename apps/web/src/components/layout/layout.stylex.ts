import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"

export const layout = stylex.defineVars({
  gutter: { default: "1.25rem", [breakpoints.md]: "2rem" },
})
