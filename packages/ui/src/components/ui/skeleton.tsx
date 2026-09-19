import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { colors, radius } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

/** The travelling highlight that reads as "loading". */
const shimmer = stylex.keyframes({
  to: { backgroundPosition: "-200% 0" },
})
const styles = stylex.create({
  base: {
    background: `linear-gradient(120deg, transparent 40%, ${colors.skeletonHighlight}, transparent 60%) ${colors.muted} 0 0 / 200% 100% fixed`,
    borderRadius: radius.sm,
    // `-1s` starts the shimmer mid-cycle, as the original did.
    animationDelay: "-1s",
    animationDuration: "2s",
    animationIterationCount: "infinite",
    animationName: shimmer,
    animationTimingFunction: "linear",
  },
})

/** See the note on SeparatorProps for why `className` sits alongside `sx`. */
export type SkeletonProps = React.ComponentProps<"div"> & {
  sx?: Sx
}

export function Skeleton({ className, sx, ...props }: SkeletonProps): React.ReactElement {
  const styleProps = stylex.props(styles.base, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="skeleton"
      style={styleProps.style}
      {...props}
    />
  )
}
