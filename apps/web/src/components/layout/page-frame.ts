import * as stylex from "@stylexjs/stylex"
import { layout } from "@/components/layout/layout.stylex"

export const pageFrame = stylex.create({
  frame: {
    marginInline: "auto",
    paddingInline: layout.gutter,
    maxWidth: layout.pageWidth,
    width: "100%",
  },
})
