import * as stylex from "@stylexjs/stylex"
import { breakpoints, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { layout } from "@/components/layout/layout.stylex"
import { mediaPageQueries } from "@/features/media/components/media-page/media-page.stylex"

export const mediaPageStyles = stylex.create({
  layout: {
    gridTemplateAreas: {
      [breakpoints.lg]: '"aside main"',
      default: '"cover header" "actions actions" "tabs tabs"',
    },
    marginInline: "auto",
    paddingInline: layout.gutter,
    columnGap: { [breakpoints.lg]: "2.5rem", default: "1rem" },
    display: "grid",
    gridTemplateColumns: {
      [breakpoints.lg]: "16rem minmax(0, 1fr)",
      default: "7rem minmax(0, 1fr)",
    },
    rowGap: "1.5rem",
    maxWidth: layout.pageWidth,
    paddingBottom: "3rem",
    paddingTop: { [breakpoints.lg]: "5rem", default: "2rem" },
  },
  aside: {
    gap: "1.25rem",
    alignSelf: { default: null, [mediaPageQueries.stickyAside]: "start" },
    display: { [breakpoints.lg]: "flex", default: "contents" },
    flexDirection: "column",
    gridColumnEnd: "aside",
    gridColumnStart: "aside",
    gridRowEnd: "aside",
    gridRowStart: "aside",
    position: { default: null, [mediaPageQueries.stickyAside]: "sticky" },
    top: "calc(var(--navbar-height) + 1rem)",
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
    display: { [breakpoints.lg]: "flex", default: "contents" },
    flexDirection: "column",
    gridColumnEnd: "main",
    gridColumnStart: "main",
    gridRowEnd: "main",
    gridRowStart: "main",
    minWidth: 0,
  },
  header: {
    gap: { [breakpoints.lg]: "0.875rem", default: "0.5rem" },
    alignSelf: { [breakpoints.lg]: "stretch", default: "end" },
    display: "flex",
    flexDirection: "column",
    gridColumnEnd: "header",
    gridColumnStart: "header",
    gridRowEnd: "header",
    gridRowStart: "header",
    justifyContent: "flex-end",
    minHeight: { [breakpoints.lg]: "12rem", default: null },
    minWidth: 0,
  },
})
