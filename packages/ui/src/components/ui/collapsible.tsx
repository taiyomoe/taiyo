"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  panel: {
    overflow: "hidden",
    transitionDuration: "200ms",
    transitionProperty: "height",
    // Base UI drives the open/close animation through this custom property.
    height: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: "var(--collapsible-panel-height)",
    },
  },
})

export function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props): React.ReactElement {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

/** See the note on SeparatorProps: `className` stays until callers migrate. */
export type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props & {
  sx?: Sx
}

export function CollapsibleTrigger({
  className,
  sx,
  ...props
}: CollapsibleTriggerProps): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <CollapsiblePrimitive.Trigger
      className={cn(styleProps.className, className)}
      data-slot="collapsible-trigger"
      style={styleProps.style}
      {...props}
    />
  )
}

export type CollapsiblePanelProps = CollapsiblePrimitive.Panel.Props & {
  sx?: Sx
}

export function CollapsiblePanel({
  className,
  sx,
  ...props
}: CollapsiblePanelProps): React.ReactElement {
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
