import type { ComponentProps } from "react"
import { cn } from "../utils/cn"

export const Label = ({ className, ...props }: ComponentProps<"label">) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: primitive component, not a form element
  <label
    className={cn(
      "block select-none font-medium text-primary text-sm leading-none transition-opacity peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className,
    )}
    data-slot="label"
    {...props}
  />
)
