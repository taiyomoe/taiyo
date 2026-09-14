import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import { type IconProps, Spinner as SpinnerIcon } from "@/components/icons"
import type { Sx } from "../../styles/sx"

/** Port of Tailwind's `animate-spin`. */
const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
})
const styles = stylex.create({
  base: {
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationName: spin,
    animationTimingFunction: "linear",
    // Inherits whatever the wrapper sets (e.g. Button's loading indicator).
    color: "currentColor",
  },
})

/** See the note on SeparatorProps: `className` stays until callers migrate. */
export type SpinnerProps = IconProps & {
  sx?: Sx
}

export function Spinner({ className, sx, ...props }: SpinnerProps): React.ReactElement {
  const styleProps = stylex.props(styles.base, sx)

  return (
    <SpinnerIcon
      aria-label="Loading"
      className={cn(styleProps.className, className)}
      role="status"
      style={styleProps.style}
      {...props}
    />
  )
}
