import * as stylex from "@stylexjs/stylex"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const dateRangeStyles = stylex.create({
  segment: {
    borderWidth: 0,
    gap: "0.5rem",
    paddingInline: "0.875rem",
    alignItems: "center",
    backgroundColor: {
      "[data-popup-open]": colors.chipHover,
      default: "transparent",
      ":hover": colors.chipHover,
    },
    color: colors.foreground,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  last: {
    borderEndEndRadius: `calc(${radius.xl} - 1px)`,
    borderStartEndRadius: `calc(${radius.xl} - 1px)`,
  },
  section: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  link: {
    borderRadius: radius.md,
    borderWidth: 0,
    paddingBlock: "0.4375rem",
    paddingInline: "0.5rem",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.accent,
    },
    color: colors.foreground,
    cursor: "pointer",
    fontSize: "0.875rem",
    textAlign: "start",
  },
  panel: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    paddingTop: "0.75rem",
  },
})
