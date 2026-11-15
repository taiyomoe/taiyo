import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  thumb: {
    borderRadius: radius.md,
    backgroundColor: colors.well,
    boxShadow: `0 0 0 1px ${colors.border}`,
    display: "block",
    flexShrink: 0,
    objectFit: "cover",
  },
  cover: {
    aspectRatio: "2 / 3",
    width: "3rem",
  },
  banner: {
    aspectRatio: "16 / 5",
    width: "9rem",
  },
})

export function StagedThumb({ src, kind }: { src: string; kind: "cover" | "banner" }) {
  return (
    <img
      alt=""
      draggable={false}
      src={src}
      sx={[styles.thumb, kind === "cover" ? styles.cover : styles.banner]}
    />
  )
}
