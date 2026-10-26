import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

export const featuredStyles = stylex.create({
  root: {
    position: "relative",
    marginTop: { default: "calc(-1 * var(--navbar-height))", "@media (width >= 50rem)": 0 },
  },
  slide: {
    overflow: "hidden",
    flexBasis: "100%",
    flexGrow: 0,
    flexShrink: 0,
    position: "relative",
    userSelect: "none",
    minWidth: 0,
  },
  backdrop: {
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
  },
  shade: {
    inset: 0,
    backgroundImage: `linear-gradient(to bottom, color-mix(in srgb, ${colors.background} 60%, transparent), ${colors.background})`,
    position: "absolute",
  },
  content: {
    gap: { default: "1.25rem", "@media (width >= 48rem)": "2.5rem" },
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2.5rem" },
    display: "flex",
    position: "relative",
    paddingBottom: { default: "2.25rem", "@media (width >= 48rem)": "2.5rem" },
    paddingTop: {
      default: "calc(var(--navbar-height) + 1.25rem)",
      "@media (width >= 48rem) and (width < 50rem)": "calc(var(--navbar-height) + 2.5rem)",
      "@media (width >= 50rem)": "2.5rem",
    },
  },
  cover: {
    height: { default: "10.5rem", "@media (width >= 48rem)": "16.5rem" },
  },
})
