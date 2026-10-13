import type React from "react"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { colors, radius } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"

const shimmer = stylex.keyframes({
  to: { backgroundPosition: "-200% 0" },
})
const styles = stylex.create({
  base: {
    background: `linear-gradient(120deg, transparent 40%, ${colors.skeletonHighlight}, transparent 60%) ${colors.muted} 0 0 / 200% 100% fixed`,
    borderRadius: radius.sm,
    animationDelay: "-1s",
    animationDuration: "2s",
    animationIterationCount: "infinite",
    animationName: shimmer,
    animationTimingFunction: "linear",
  },
})

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
