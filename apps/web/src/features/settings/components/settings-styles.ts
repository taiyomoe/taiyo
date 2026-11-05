import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const settingsStyles = stylex.create({
  stack: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  form: {
    gap: "1.125rem",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.sm]: "repeat(2, minmax(0, 1fr))",
    },
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    width: "100%",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  item: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.875rem",
    paddingBlock: "0.875rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  itemIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  itemMain: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  itemTitle: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    fontWeight: 600,
  },
  itemMeta: {
    gap: "0.75rem",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
  mono: {
    fontFamily: font.mono,
  },
})
