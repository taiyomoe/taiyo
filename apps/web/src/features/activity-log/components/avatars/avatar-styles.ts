import * as stylex from "@stylexjs/stylex"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const avatarStyles = stylex.create({
  size: (size: string) => ({
    height: size,
    width: size,
  }),
  image: {
    inset: 0,
    display: "block",
    objectFit: "cover",
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  tile: (color: string) => ({
    borderRadius: radius.md,
    overflow: "hidden",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
    color,
    display: "inline-flex",
    flexShrink: 0,
    fontWeight: 700,
    justifyContent: "center",
    position: "relative",
  }),
})
