import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"

export const latestStyles = stylex.create({
  inline: {
    gap: "0.625rem",
    alignItems: "baseline",
    display: "flex",
    minWidth: 0,
  },
  chapterTitle: {
    overflow: "hidden",
    color: colors.mutedForeground,
    display: { [breakpoints.sm]: "block", default: "none" },
    flexShrink: 100,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  skeletonTitle: {
    height: "0.875rem",
    width: "min(16rem, 60%)",
  },
  skeletonTime: {
    justifySelf: "end",
    height: "0.75rem",
    width: "3rem",
  },
})
