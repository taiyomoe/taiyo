import * as stylex from "@stylexjs/stylex"
import { radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import type { CSSProperties, ReactNode } from "react"

import { scene, sceneFont } from "@/components/scene/scene.stylex"

// Deterministic gradient placeholders until real cover images are wired in.
// Hashing the title means a given series always gets the same colours, on the
// server and in the browser, so the strip never flickers on hydration.
const GRADIENTS: [string, string][] = [
  ["#f2452d", "#ffb820"],
  ["#2e7de0", "#9333ea"],
  ["#1fa85b", "#0ea5a5"],
  ["#8e2015", "#f2452d"],
  ["#cc7a04", "#ffb820"],
  ["#6d28d9", "#2e7de0"],
  ["#db3420", "#6b1810"],
  ["#0f766e", "#1fa85b"],
]
const hash = (value: string) => {
  let h = 0

  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0
  }

  return Math.abs(h)
}
const styles = stylex.create({
  cover: {
    borderRadius: radius.md,
    overflow: "hidden",
    aspectRatio: "2 / 3",
    position: "relative",
    width: "100%",
  },
  caption: {
    inset: 0,
    padding: "0.875rem",
    gap: "0.375rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    position: "absolute",
    zIndex: 2,
  },
  title: {
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: text.base,
    fontWeight: 900,
    lineHeight: 1.15,
    textShadow: "0 2px 8px rgba(0,0,0,0.35)",
    textWrap: "balance",
  },
})

type CoverArtProps = {
  title: string
  /** Full-bleed layers painted BEHIND the caption (a gradient scrim, say). */
  children?: ReactNode
  /** Stacked under the title inside the caption, so the two never collide. */
  footer?: ReactNode
  style?: CSSProperties
}

export const CoverArt = ({ title, children, footer, style }: CoverArtProps) => {
  const [from, to] = GRADIENTS[hash(title) % GRADIENTS.length] as [string, string]
  const styleProps = stylex.props(styles.cover)

  return (
    <div
      className={styleProps.className}
      style={{
        ...styleProps.style,
        backgroundImage: `linear-gradient(150deg, ${from}, ${to})`,
        ...style,
      }}
    >
      {children}
      <div sx={styles.caption}>
        <span sx={styles.title}>{title}</span>
        {footer}
      </div>
    </div>
  )
}
