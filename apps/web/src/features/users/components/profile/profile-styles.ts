import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"

export const profileStyles = stylex.create({
  root: {
    isolation: "isolate",
    position: "relative",
  },
  backdrop: {
    display: { default: "none", [breakpoints.md]: "contents" },
  },
  container: {
    marginInline: "auto",
    paddingInline: { default: 0, [breakpoints.md]: "2rem" },
    maxWidth: "88rem",
    paddingTop: { default: 0, [breakpoints.md]: "1.25rem" },
  },
  layout: {
    gridTemplateAreas: {
      [breakpoints.lg]: '"aside main"',
      default: '"avatar header" "actions actions" "tabs tabs"',
    },
    marginInline: "auto",
    paddingInline: { default: "1.25rem", [breakpoints.md]: "2rem" },
    alignItems: "start",
    columnGap: { [breakpoints.lg]: "2.5rem", default: "1rem" },
    display: "grid",
    gridTemplateColumns: {
      [breakpoints.lg]: "15rem minmax(0, 1fr)",
      default: "6.5rem minmax(0, 1fr)",
    },
    rowGap: "1.25rem",
    maxWidth: "88rem",
    paddingBottom: "3rem",
  },
  aside: {
    gridArea: { [breakpoints.lg]: "aside", default: null },
    gap: "1.25rem",
    display: { [breakpoints.lg]: "flex", default: "contents" },
    flexDirection: "column",
  },
  avatarSlot: {
    gridArea: { [breakpoints.lg]: null, default: "avatar" },
    position: "relative",
    zIndex: 1,
    marginTop: { default: "-3.25rem", [breakpoints.lg]: "-7.5rem" },
  },
  actionsSlot: {
    gridArea: { [breakpoints.lg]: null, default: "actions" },
    minWidth: 0,
  },
  main: {
    gridArea: { [breakpoints.lg]: "main", default: null },
    gap: "1.75rem",
    display: { [breakpoints.lg]: "flex", default: "contents" },
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gridArea: { [breakpoints.lg]: null, default: "header" },
    gap: "0.5rem",
    alignSelf: { default: "end", [breakpoints.lg]: "stretch" },
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    minWidth: 0,
    paddingTop: { default: "0.75rem", [breakpoints.lg]: "1.25rem" },
  },
  tabsSlot: {
    gridArea: { [breakpoints.lg]: null, default: "tabs" },
    minWidth: 0,
  },
  card: {
    padding: { default: "1rem", [breakpoints.md]: "1.25rem" },
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
  },
  sectionTitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 650,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
})
