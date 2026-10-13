import type React from "react"
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { cn } from "../../utils/cn"

const styles = stylex.create({
  base: {
    gap: "0.75rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
})

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
