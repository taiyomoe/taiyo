import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

export const navbarBleed = stylex.create({
  banner: {
    boxSizing: "content-box",
    marginTop: "calc(-1 * var(--navbar-height))",
    paddingTop: "var(--navbar-height)",
  },
  scrim: {
    inset: 0,
    backgroundImage: `linear-gradient(to bottom, color-mix(in srgb, ${colors.background} 72%, transparent), color-mix(in srgb, ${colors.background} 48%, transparent) var(--navbar-height), transparent calc(var(--navbar-height) * 2.25))`,
    pointerEvents: "none",
    position: "absolute",
  },
})
