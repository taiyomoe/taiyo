"use client"

import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  base: {
    gap: "0.75rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
})

/** See the note on SeparatorProps for why `className` sits alongside `sx`. */
export type CheckboxGroupProps = CheckboxGroupPrimitive.Props & {
  sx?: Sx
}

export function CheckboxGroup({ className, sx, ...props }: CheckboxGroupProps): React.ReactElement {
  const styleProps = stylex.props(styles.base, sx)

  return (
    <CheckboxGroupPrimitive
      className={cn(styleProps.className, className)}
      style={styleProps.style}
      {...props}
    />
  )
}

export { CheckboxGroupPrimitive }
