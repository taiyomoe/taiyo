import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { sceneFont } from "@/components/scene/scene.stylex"

export const groupStyles = stylex.create({
  panel: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  card: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
  },
  heading: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "baseline",
    color: colors.foreground,
    display: "flex",
    fontFamily: sceneFont.display,
    fontSize: "1.375rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
  },
  headingCount: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  toolbar: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  count: {
    margin: 0,
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
  },
  label: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  mono: {
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
  },
  desktopOnly: {
    display: { [breakpoints.lg]: "flex", default: "none" },
  },
  mobileOnly: {
    display: { [breakpoints.lg]: "none", default: "flex" },
  },
})
