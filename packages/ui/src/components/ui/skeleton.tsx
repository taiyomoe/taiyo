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
    backgroundPosition: "0 0",
    borderRadius: radius.sm,
    animationDelay: "-1s",
    animationDuration: "2s",
    animationIterationCount: "infinite",
    animationName: shimmer,
    animationTimingFunction: "linear",
    backgroundAttachment: "fixed",
    backgroundColor: colors.skeleton,
    backgroundImage: `linear-gradient(120deg, transparent 40%, ${colors.skeletonHighlight}, transparent 60%)`,
    backgroundSize: "200% 100%",
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
