import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { colors } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  base: {
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  horizontal: {
    height: 1,
    width: "100%",
  },
  vertical: {
    alignSelf: "stretch",
    width: 1,
  },
})

/**
 * StyleX styles arrive via `sx`, not `style`: `style` stays bound to React's
 * inline-CSS prop, which callers still use for CSS custom properties.
 *
 * `className` is kept as a plain DOM pass-through. Nothing in this package
 * styles through it — that is what `sx` is for — but third-party libraries
 * hand components a class name to render (react-day-picker's `classNames` map,
 * for one), and tests and animation hooks target them.
 */
export type SeparatorProps = SeparatorPrimitive.Props & {
  sx?: Sx
}

export function Separator({
  className,
  sx,
  orientation = "horizontal",
  ...props
}: SeparatorProps): React.ReactElement {
  const styleProps = stylex.props(
    styles.base,
    orientation === "horizontal" ? styles.horizontal : styles.vertical,
    sx,
  )

  return (
    <SeparatorPrimitive
      className={cn(styleProps.className, className)}
      data-slot="separator"
      orientation={orientation}
      style={styleProps.style}
      {...props}
    />
  )
}

export { SeparatorPrimitive }
