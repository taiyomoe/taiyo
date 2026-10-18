import * as stylex from "@stylexjs/stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"

export const kqlStyles = stylex.create({
  text: {
    margin: 0,
    borderWidth: 0,
    paddingBlock: "0.5625rem",
    paddingInline: 0,
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontVariantLigatures: "none",
    letterSpacing: "normal",
    lineHeight: "1.5rem",
    overflowWrap: "anywhere",
    tabSize: 2,
    whiteSpace: "pre-wrap",
  },
})
