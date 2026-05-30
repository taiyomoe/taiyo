import type { ComponentProps } from "react"
import { tv } from "tailwind-variants"

export const labelVariants = tv({
  base: "line-clamp-1 block text-sm font-medium text-primary transition-opacity select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
})

export const Label = ({ className, ...props }: ComponentProps<"label">) => (
  <label className={labelVariants({ className })} data-slot="label" {...props} />
)
