import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { isAvatarBorder } from "@taiyomoe/db/cosmetics"
import { BORDER_ART } from "@/components/avatar-border/border-art"
import { VIEW_BOX } from "@/components/avatar-border/geometry"

const styles = stylex.create({
  root: {
    borderRadius: "50%",
    display: "inline-flex",
    flexShrink: 0,
    isolation: "isolate",
    position: "relative",
  },
  art: {
    overflow: "visible",
    pointerEvents: "none",
    position: "absolute",
    zIndex: 1,
    height: "136%",
    left: "-18%",
    top: "-18%",
    width: "136%",
  },
})

function AvatarBorderArt({ border, sx }: { border: string | null | undefined; sx?: Sx }) {
  if (!isAvatarBorder(border)) {
    return null
  }

  const Art = BORDER_ART[border]

  return (
    <svg aria-hidden data-avatar-border={border} sx={[styles.art, sx]} viewBox={VIEW_BOX}>
      <Art />
    </svg>
  )
}

export function AvatarBorder({
  border,
  children,
  sx,
}: {
  border: string | null | undefined
  children: ReactNode
  sx?: Sx
}) {
  if (!isAvatarBorder(border)) {
    return children
  }

  return (
    <span sx={[styles.root, sx]}>
      {children}
      <AvatarBorderArt border={border} />
    </span>
  )
}
