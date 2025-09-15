import { cn } from "@taiyomoe/ui/utils/cn"
import type { HTMLAttributes } from "react"

export const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("animate-pulse rounded bg-subtle", className)}
    {...props}
  />
)
