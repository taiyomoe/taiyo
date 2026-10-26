import * as stylex from "@stylexjs/stylex"
import { radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"

const DESKTOP = "@media (width >= 64rem)"

export const mediaPageStyles = stylex.create({
  layout: {
    gridTemplateAreas: {
      [DESKTOP]: '"aside main"',
      default: '"cover header" "actions actions" "tabs tabs"',
    },
    marginInline: "auto",
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2rem" },
    columnGap: { [DESKTOP]: "2.5rem", default: "1rem" },
    display: "grid",
    gridTemplateColumns: {
      [DESKTOP]: "16rem minmax(0, 1fr)",
      default: "7rem minmax(0, 1fr)",
    },
    rowGap: "1.5rem",
    maxWidth: "88rem",
    paddingBottom: "3rem",
    paddingTop: { [DESKTOP]: "5rem", default: "2rem" },
  },
  aside: {
    gap: "1.25rem",
    display: { [DESKTOP]: "flex", default: "contents" },
    flexDirection: "column",
    gridColumnEnd: "aside",
    gridColumnStart: "aside",
    gridRowEnd: "aside",
    gridRowStart: "aside",
  },
  coverSlot: {
    gridColumnEnd: "cover",
    gridColumnStart: "cover",
    gridRowEnd: "cover",
    gridRowStart: "cover",
  },
  cover: {
    borderRadius: radius.xl,
    boxShadow: shadows.overlay,
    width: "100%",
  },
  main: {
    gap: "2rem",
    display: { [DESKTOP]: "flex", default: "contents" },
    flexDirection: "column",
    gridColumnEnd: "main",
    gridColumnStart: "main",
    gridRowEnd: "main",
    gridRowStart: "main",
    minWidth: 0,
  },
  header: {
    gap: { [DESKTOP]: "0.875rem", default: "0.5rem" },
    alignSelf: { [DESKTOP]: "stretch", default: "end" },
    display: "flex",
    flexDirection: "column",
    gridColumnEnd: "header",
    gridColumnStart: "header",
    gridRowEnd: "header",
    gridRowStart: "header",
    justifyContent: "flex-end",
    minHeight: { [DESKTOP]: "12rem", default: null },
    minWidth: 0,
  },
})
