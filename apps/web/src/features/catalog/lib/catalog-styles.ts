import * as stylex from "@stylexjs/stylex"
import { colors, containers, font } from "@taiyomoe/ui/styles/tokens.stylex"

export type CatalogBreakpoint = "2xl" | "3xl" | "4xl"

export const catalogStyles = stylex.create({
  colBanner: { width: "9rem" },
  colNarrow: { width: "6.5rem" },
  colMedium: { width: "8.5rem" },
  colWide: { width: "11rem" },
  colTarget: { width: "13rem" },
  colActions: { width: "3.25rem" },
  numeric: {
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
  },
  muted: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  stack: {
    gap: "0.375rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  inline: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
})

/** Shows a table cell only once the table reaches the breakpoint. */
export const catalogShownFrom = stylex.create({
  "2xl": { display: { default: "none", [containers["2xl"]]: "table-cell" } },
  "3xl": { display: { default: "none", [containers["3xl"]]: "table-cell" } },
  "4xl": { display: { default: "none", [containers["4xl"]]: "table-cell" } },
})

/** Shows inline details only while the table is narrower than the breakpoint. */
export const catalogHiddenFrom = stylex.create({
  "2xl": { display: { default: "flex", [containers["2xl"]]: "none" } },
  "3xl": { display: { default: "flex", [containers["3xl"]]: "none" } },
  "4xl": { display: { default: "flex", [containers["4xl"]]: "none" } },
})
