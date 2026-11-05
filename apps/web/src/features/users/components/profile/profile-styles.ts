import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"

export const profileStyles = stylex.create({
  root: {
    isolation: "isolate",
    position: "relative",
    paddingBottom: "4rem",
  },
  container: {
    gap: "1.75rem",
    marginInline: "auto",
    paddingInline: { default: "1rem", [breakpoints.md]: "2rem" },
    display: "flex",
    flexDirection: "column",
    maxWidth: "72rem",
    width: "100%",
  },
  card: {
    padding: { default: "1.25rem", [breakpoints.md]: "1.5rem" },
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
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
