import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const commentStyles = stylex.create({
  item: {
    borderRadius: radius.xl,
    gap: { default: "0.75rem", [breakpoints.sm]: "0.875rem" },
    paddingBlock: "0.875rem",
    alignItems: "flex-start",
    display: "flex",
    transitionDuration: "600ms",
    transitionProperty: "background-color, box-shadow",
    scrollMarginTop: "6rem",
  },
  highlighted: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 7%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${colors.primary} 28%, transparent)`,
    marginInlineStart: "-0.875rem",
    paddingInlineEnd: "0.5rem",
    paddingInlineStart: "0.875rem",
  },
  avatar: {
    flexShrink: 0,
    height: { default: "2.25rem", [breakpoints.sm]: "2.5rem" },
    width: { default: "2.25rem", [breakpoints.sm]: "2.5rem" },
  },
  replyAvatar: {
    height: { default: "1.875rem", [breakpoints.sm]: "2rem" },
    width: { default: "1.875rem", [breakpoints.sm]: "2rem" },
  },
  body: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
})
