"use client"

import { Form as FormPrimitive } from "@base-ui/react/form"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import type { Sx } from "../../styles/sx"

/** See the note on SeparatorProps: `className` stays until callers migrate. */
export type FormProps = FormPrimitive.Props & {
  sx?: Sx
}

export function Form({ className, sx, ...props }: FormProps): React.ReactElement {
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
