import {
  Label as AriaLabel,
  type LabelProps as AriaLabelProps,
} from "react-aria-components"
import { cn } from "~/utils/cn"

export type LabelProps = AriaLabelProps

export const Label = ({ className, ...props }: LabelProps) => (
  <AriaLabel
    className={cn(
      "block font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
)
