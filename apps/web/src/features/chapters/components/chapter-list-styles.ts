import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"

export const chapterListStyles = stylex.create({
  chapter: {
    gridTemplateAreas: {
      [breakpoints.md]: '"label time" "groups uploader"',
      default: '"label time" "groups groups" "uploader uploader"',
    },
    paddingBlock: "0.625rem",
    columnGap: "1.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    rowGap: "0.375rem",
    borderTopColor: { default: colors.border, ":first-child": "transparent" },
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
})
