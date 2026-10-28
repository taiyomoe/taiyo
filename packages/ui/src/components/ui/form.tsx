import type React from "react"
import { Form as FormPrimitive } from "@base-ui/react/form"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { cn } from "../../utils/cn"

export function Form({
  className,
  sx,
  ...props
}: FormPrimitive.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <FormPrimitive
      className={cn(styleProps.className, className)}
      data-slot="form"
      style={styleProps.style}
      {...props}
    />
  )
}

export { FormPrimitive }
