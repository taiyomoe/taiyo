import type React from "react"
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { colors } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"

const styles = stylex.create({
  legend: {
    color: colors.foreground,
    fontWeight: 600,
  },
})

export function Fieldset({
  className,
  sx,
  ...props
}: FieldsetPrimitive.Root.Props & {
  sx?: Sx
}): React.ReactElement {
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

export function FieldsetLegend({
  className,
  sx,
  ...props
}: FieldsetPrimitive.Legend.Props & {
  sx?: Sx
}): React.ReactElement {
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
