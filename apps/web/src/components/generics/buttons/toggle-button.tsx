import { forwardRef } from "react"
import {
  ToggleButton as BaseToggleButton,
  type ToggleButtonProps,
} from "react-aria-components"
import { cn } from "~/lib/utils/cn"

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ className, ...rest }, ref) => (
    <BaseToggleButton
      ref={ref}
      className={cn(
        "w-full rounded-md bg-content2 px-2 py-1 text-default-500 text-sm uppercase outline-none transition-all duration-200 data-[selected=true]:bg-primary data-[selected=true]:text-content2-foreground [&:not([data-selected=true])]:hover:bg-content4",
        className,
      )}
      {...rest}
    />
  ),
)
