"use client"

import type { HTMLAttributes } from "react"
import { type SeparatorProps, useSeparator } from "react-aria"
import { cn } from "~/utils/cn"

type Props = HTMLAttributes<HTMLDivElement> & SeparatorProps

export const Separator = ({ className, children, ...props }: Props) => {
  const { separatorProps } = useSeparator(props)

  if (children) {
    return (
      <div
        className={cn("relative size-px bg-emphasis", className)}
        {...separatorProps}
        {...props}
      >
        <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 bg-subtle px-2 text-sm text-subtle dark:bg-default">
          {children}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn("size-px bg-emphasis", className)}
      {...separatorProps}
      {...props}
    />
  )
}
