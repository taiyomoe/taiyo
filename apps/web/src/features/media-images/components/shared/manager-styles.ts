import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const managerStyles = stylex.create({
  layout: {
    gap: "1.5rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [breakpoints.lg]: "22rem minmax(0, 1fr)" },
  },
  column: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  card: {
    padding: "1.5rem",
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1.25rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
    position: { default: "static", [breakpoints.lg]: "sticky" },
    minWidth: 0,
    top: "calc(var(--navbar-height) + 1.5rem)",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
  },
})
