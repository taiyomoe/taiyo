import { cn } from "@taiyomoe/ui/utils/cn"
import type { ComponentProps } from "react"

export const ShineButton = ({
  className,
  ...props
}: ComponentProps<"button">) => {
  return (
    <button
      className={cn(
        "flex w-full animate-shine items-center justify-center gap-2 rounded border bg-[linear-gradient(110deg,var(--background),45%,var(--background-emphasis),55%,var(--background))] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform",
        "bg-[length:400%_100%] px-3 py-2 font-medium text-primary text-sm transition-colors hover:border-emphasis hover:bg-muted!",
        className,
      )}
      type="button"
      {...props}
    />
  )
}
