import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

export const changelogProse = stylex.create({
  text: {
    color: `color-mix(in srgb, ${colors.foreground} 82%, ${colors.background})`,
    fontSize: "1.0625rem",
    lineHeight: 1.6,
    textWrap: "pretty",
  },
  p: {
    margin: 0,
  },
  ul: {
    margin: 0,
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    listStyleType: "disc",
    paddingLeft: "1.5rem",
  },
})
