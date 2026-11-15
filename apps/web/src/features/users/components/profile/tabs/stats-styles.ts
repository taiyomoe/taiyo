import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"

export const statsStyles = stylex.create({
  root: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  tile: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  tileLabel: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  grid: {
    gap: "1.25rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.md]: {
        default: "repeat(2, minmax(0, 1fr))",
        [breakpoints.xl]: "repeat(3, minmax(0, 1fr))",
      },
    },
  },
  cardBody: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  cardHead: {
    gap: "0.75rem",
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardNote: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  skeletonTop: {
    gap: "1.25rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.lg]: "minmax(0, 2fr) minmax(0, 1fr)",
    },
  },
  skeletonCard: {
    height: "12rem",
  },
})
