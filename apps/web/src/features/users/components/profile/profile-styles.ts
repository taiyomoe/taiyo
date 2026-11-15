import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { layout } from "@/components/layout/layout.stylex"

export const profileStyles = stylex.create({
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
  card: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    paddingTop: "1.25rem",
  },
  flush: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  sectionTitle: {
    margin: 0,
    color: colors.foreground,
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
})
