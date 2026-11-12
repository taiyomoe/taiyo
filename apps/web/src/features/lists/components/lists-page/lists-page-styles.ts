import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

export const listsPageStyles = stylex.create({
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.125rem",
    fontWeight: 650,
    letterSpacing: "-0.01em",
  },
  sectionCount: {
    color: colors.mutedForeground,
    fontWeight: 500,
    marginInlineStart: "0.5rem",
  },
  rows: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
})
