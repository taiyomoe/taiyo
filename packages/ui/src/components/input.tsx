"use client"

import { Input as BaseInput } from "@base-ui-components/react/input"
import type { ComponentProps } from "react"
import { cn } from "../utils/cn"

export type InputProps = ComponentProps<typeof BaseInput>

export const Input = ({ className, ...props }: InputProps) => (
  <BaseInput
    className={cn(
      "flex h-9 w-full rounded border border-subtle bg-muted px-3 py-2 text-primary text-sm transition placeholder:select-none placeholder:text-subtle hover:not-disabled:border-emphasis",
      "focus:outline-hidden focus:ring-2 focus:ring-primary",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    title={props.placeholder}
    {...props}
  />
)
