import * as stylex from "@stylexjs/stylex"
import { Book } from "@taiyomoe/ui/components/icons"
import type { Sx } from "@taiyomoe/ui/styles/sx"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReactNode } from "react"

const COVER_WIDTH = 400
const COVER_HEIGHT = 600
const styles = stylex.create({
  frame: {
    borderRadius: radius.xl,
    overflow: "hidden",
    aspectRatio: "2 / 3",
    backgroundColor: colors.well,
    boxShadow: shadows.raised,
    position: "relative",
    width: "100%",
    "::after": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: `inset 0 0 0 1px ${colors.border}`,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  image: {
    display: "block",
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
  placeholder: {
    placeItems: "center",
    color: colors.mutedForeground,
    display: "grid",
    height: "100%",
    width: "100%",
  },
  placeholderIcon: {
    opacity: 0.6,
    height: "2rem",
    width: "2rem",
  },
})

export function MediaCover({
  url,
  alt,
  loading = "lazy",
  sx,
  children,
}: {
  url: string | null
  alt: string
  loading?: "lazy" | "eager"
  sx?: Sx
  children?: ReactNode
}) {
  return (
    <div sx={[styles.frame, sx]}>
      {url ? (
        <img
          alt={alt}
          decoding="async"
          height={COVER_HEIGHT}
          loading={loading}
          src={url}
          sx={styles.image}
          width={COVER_WIDTH}
        />
      ) : (
        <div aria-label={alt} role="img" sx={styles.placeholder}>
          <Book {...stylex.props(styles.placeholderIcon)} />
        </div>
      )}
      {children}
    </div>
  )
}
