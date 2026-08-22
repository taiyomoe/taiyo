import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import { colors } from "@/styles/tokens.stylex"

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
    // The Tailwind original guarded this with
    // `not-[[class^='h-']]:not-[[class*='_h-']]` so a caller-supplied height
    // class could win. StyleX merges caller styles last, so they override
    // directly and the guard is unnecessary.
    alignSelf: "stretch",
    width: 1,
  },
})

/**
 * StyleX styles arrive via `sx`, not `style`: `style` stays bound to React's
 * inline-CSS prop, which callers still use for CSS custom properties.
 *
 * `className` is retained for the duration of the Tailwind -> StyleX migration.
 * Un-migrated callers still pass Tailwind classes, and dropping the prop would
 * force every consumer to migrate in the same commit. Remove it once no caller
 * passes `className`.
 */
export type SeparatorProps = SeparatorPrimitive.Props & {
  sx?: stylex.StyleXStyles
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
