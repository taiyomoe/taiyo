import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const DESKTOP = "@media (width >= 48rem)"

export const chapterListStyles = stylex.create({
  chapter: {
    gridTemplateAreas: {
      [DESKTOP]: '"label time" "groups uploader"',
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
