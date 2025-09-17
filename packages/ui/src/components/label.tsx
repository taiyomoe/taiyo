import type { ComponentProps } from "react"
import { tv } from "tailwind-variants"

export const labelVariants = tv({
  base: "line-clamp-1 block select-none font-medium text-primary text-sm transition-opacity peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
})

export const Label = ({ className, ...props }: ComponentProps<"label">) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: primitive component, not a form element
  <label
    className={labelVariants({ className })}
    data-slot="label"
    {...props}
  />
)
