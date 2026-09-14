"use client"

import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import { colors } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  legend: {
    color: colors.foreground,
    fontWeight: 600,
  },
})

/** See the note on SeparatorProps: `className` stays until callers migrate. */
export type FieldsetProps = FieldsetPrimitive.Root.Props & {
  sx?: Sx
}

export function Fieldset({ className, sx, ...props }: FieldsetProps): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <FieldsetPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="fieldset"
      style={styleProps.style}
      {...props}
    />
  )
}

export type FieldsetLegendProps = FieldsetPrimitive.Legend.Props & {
  sx?: Sx
}

export function FieldsetLegend({
  className,
  sx,
  ...props
}: FieldsetLegendProps): React.ReactElement {
  const styleProps = stylex.props(styles.legend, sx)

  return (
    <FieldsetPrimitive.Legend
      className={cn(styleProps.className, className)}
      data-slot="fieldset-legend"
      style={styleProps.style}
      {...props}
    />
  )
}

export { FieldsetPrimitive }
