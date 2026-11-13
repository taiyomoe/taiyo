import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { layout } from "@/components/layout/layout.stylex"

export const groupProfileStyles = stylex.create({
  root: {
    isolation: "isolate",
    position: "relative",
    paddingBottom: "4rem",
  },
  container: {
    gap: "1.75rem",
    marginInline: "auto",
    paddingInline: layout.gutter,
    display: "flex",
    flexDirection: "column",
    maxWidth: "72rem",
    width: "100%",
  },
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    minWidth: 0,
    paddingTop: "1.25rem",
  },
  flush: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  sectionHead: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  sectionTitle: {
    margin: 0,
    color: colors.foreground,
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  count: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontWeight: 400,
    marginInlineStart: "0.5rem",
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
  grid: {
    gap: "1.25rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.lg]: "minmax(0, 1fr) 20rem",
    },
  },
  column: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
})
