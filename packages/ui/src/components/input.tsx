"use client"

import { Input as BaseInput } from "@base-ui-components/react/input"
import type { ComponentProps } from "react"
import { cn } from "../utils/cn"

export const Input = ({
  className,
  ...props
}: ComponentProps<typeof BaseInput>) => (
  <BaseInput
    className={cn(
      "flex h-9 w-full rounded border border-subtle bg-muted px-3 py-2 text-primary text-sm transition placeholder:text-subtle hover:not-disabled:border-emphasis",
      "focus:outline-hidden focus:ring-2 focus:ring-primary",
      "disabled:cursor-not-allowed disabled:bg-subtle disabled:text-subtle disabled:placeholder:text-subtle",
      className,
    )}
    title={props.placeholder}
    {...props}
  />
)
