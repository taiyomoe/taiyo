import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  link: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.muted,
    display: "block",
    flexShrink: 0,
  },
  cover: {
    aspectRatio: "2 / 3",
    width: "2.25rem",
  },
  banner: {
    aspectRatio: "16 / 5",
    width: "6.5rem",
  },
  image: {
    display: "block",
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
})

export function ImageThumb({
  kind,
  src,
  label,
}: {
  kind: "cover" | "banner"
  src: string
  label: string
}) {
  return (
    <a
      aria-label={label}
      href={src}
      rel="noreferrer"
      sx={[styles.link, styles[kind]]}
      target="_blank"
    >
      <img alt="" decoding="async" loading="lazy" src={src} sx={styles.image} />
    </a>
  )
}
