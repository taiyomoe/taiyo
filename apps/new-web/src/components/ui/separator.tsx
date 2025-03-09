"use client"

import type { HTMLAttributes } from "react"
import { type SeparatorProps, useSeparator } from "react-aria"
import { cn } from "~/utils/cn"

type Props = HTMLAttributes<HTMLDivElement> & SeparatorProps

export const Separator = ({ className, ...props }: Props) => {
  const { separatorProps } = useSeparator(props)

  return (
    <div
      className={cn("size-px bg-subtle", className)}
      {...separatorProps}
      {...props}
    />
  )
}
