import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const DESKTOP = "@media (width >= 64rem)"
const styles = stylex.create({
  backdrop: {
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
    zIndex: -1,
    height: { [DESKTOP]: "26rem", default: "18rem" },
    left: 0,
    right: 0,
    top: 0,
  },
  backdropImage: {
    filter: "blur(6px) saturate(120%)",
    objectFit: "cover",
    objectPosition: "50% 30%",
    opacity: 0.85,
    transform: "scale(1.06)",
    height: "100%",
    width: "100%",
  },
  shade: {
    inset: 0,
    backgroundImage: `linear-gradient(to bottom, color-mix(in srgb, ${colors.background} 35%, transparent), color-mix(in srgb, ${colors.background} 70%, transparent) 55%, ${colors.background})`,
    position: "absolute",
  },
})

type MediaBackdropProps = {
  src: string | null
}

export function MediaBackdrop({ src }: MediaBackdropProps) {
  return (
    <div aria-hidden sx={styles.backdrop}>
      {src === null ? null : (
        <img alt="" decoding="async" draggable={false} src={src} sx={styles.backdropImage} />
      )}
      <div sx={styles.shade} />
    </div>
  )
}
