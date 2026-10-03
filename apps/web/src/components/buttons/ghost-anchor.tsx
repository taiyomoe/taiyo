import * as stylex from "@stylexjs/stylex"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { cn } from "@taiyomoe/ui/utils/cn"
import type { ComponentProps } from "react"

import { scene } from "@/components/scene/scene.stylex"

// The quiet half of the landing page's CTA pairs: same pill geometry as
// SunButton so the two sit on one baseline, but a translucent fill instead of
// the gradient, so only one call to action carries the sun.
const styles = stylex.create({
  base: {
    borderColor: `color-mix(in srgb, ${scene.paper} 18%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: "1px",
    gap: "0.5rem",
    paddingInline: "1.875rem",
    alignItems: "center",
    backgroundColor: {
      default: `color-mix(in srgb, ${scene.paper} 4%, transparent)`,
      ":hover": `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    },
    color: scene.paper,
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: font.sans,
    fontSize: text.lg,
    fontWeight: 800,
    justifyContent: "center",
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "background-color",
    whiteSpace: "nowrap",
    height: "3.625rem",
  },
})

/** In-page jump styled to sit beside SunLink on the same baseline. */
export const GhostAnchor = ({ className, style, ...props }: ComponentProps<"a">) => {
  const styleProps = stylex.props(styles.base)

  return (
    <a
      className={cn(styleProps.className, className)}
      style={{ ...styleProps.style, ...style }}
      {...props}
    />
  )
}
