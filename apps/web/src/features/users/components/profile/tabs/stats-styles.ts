import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"

export const statsStyles = stylex.create({
  root: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  tiles: {
    gap: "0.75rem",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [breakpoints.md]: "repeat(4, minmax(0, 1fr))",
    },
  },
  tile: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  tileValue: {
    fontFamily: font.mono,
    fontSize: { default: "1.5rem", [breakpoints.md]: "1.875rem" },
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  tileUnit: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontWeight: 500,
    marginInlineStart: "0.25rem",
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
      [breakpoints.md]: "repeat(2, minmax(0, 1fr))",
      [breakpoints.xl]: "repeat(3, minmax(0, 1fr))",
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
  skeletonTile: {
    height: "5.25rem",
  },
  skeletonCard: {
    height: "12rem",
  },
})
