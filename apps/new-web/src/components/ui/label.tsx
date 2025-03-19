import {
  Label as AriaLabel,
  type LabelProps as AriaLabelProps,
} from "react-aria-components"
import { tv } from "tailwind-variants"

export const labelVariants = tv({
  base: "block font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
})

export type LabelProps = AriaLabelProps

export const Label = ({ className, ...props }: LabelProps) => (
  <AriaLabel className={labelVariants({ className })} {...props} />
)
