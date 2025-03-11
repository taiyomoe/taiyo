"use client"

import { Input as AriaInput, type InputProps } from "react-aria-components"
import { cn } from "~/utils/cn"

export const Input = ({ className, ...props }: InputProps) => (
  <AriaInput
    className={cn(
      "flex h-9 w-full rounded border bg-default px-3 py-2 text-emphasis text-sm transition placeholder:text-muted not-[disabled]:hover:border-emphasis dark:text-default dark:placeholder:text-emphasis",
      "focus:outline-hidden focus:ring-2 focus:ring-primary",
      "disabled:cursor-not-allowed disabled:bg-subtle",
      className,
    )}
    {...props}
  />
)
