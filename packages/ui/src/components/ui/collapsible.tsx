import type React from "react"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { collapsibleTriggerMarker } from "../../styles/markers.stylex"
import { motion } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"

const styles = stylex.create({
  panel: {
    overflow: "hidden",
    transitionDuration: {
      "[data-ending-style]": motion.exitLarge,
      default: motion.enterLarge,
    },
    transitionProperty: "height",
    transitionTimingFunction: motion.easeOut,
    height: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: "var(--collapsible-panel-height)",
    },
  },
})

export function Collapsible({
  className,
  sx,
  ...props
}: CollapsiblePrimitive.Root.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <CollapsiblePrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="collapsible"
      style={styleProps.style}
      {...props}
    />
  )
}

export function CollapsibleTrigger({
  className,
  sx,
  ...props
}: CollapsiblePrimitive.Trigger.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(collapsibleTriggerMarker, sx)

  return (
    <CollapsiblePrimitive.Trigger
      className={cn(styleProps.className, className)}
      data-slot="collapsible-trigger"
      style={styleProps.style}
      {...props}
    />
  )
}

export function CollapsiblePanel({
  className,
  sx,
  ...props
}: CollapsiblePrimitive.Panel.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.panel, sx)

  return (
    <CollapsiblePrimitive.Panel
      className={cn(styleProps.className, className)}
      data-slot="collapsible-panel"
      style={styleProps.style}
      {...props}
    />
  )
}

export { CollapsiblePrimitive, CollapsiblePanel as CollapsibleContent }
