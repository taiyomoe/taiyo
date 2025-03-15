import { Button, type ButtonProps } from "react-aria-components"
import { cn } from "~/utils/cn"

export const ShineButton = ({ className, ...props }: ButtonProps) => {
  return (
    <Button
      className={cn(
        "flex w-full animate-shine items-center justify-center gap-2 rounded border bg-[linear-gradient(110deg,var(--background),45%,#303030,55%,var(--background))] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform",
        "bg-[length:400%_100%] px-3 py-2 font-medium text-primary text-sm transition-colors hover:border-emphasis hover:bg-muted!",
        className,
      )}
      {...props}
    />
  )
}
