import { cn } from "@taiyomoe/ui/utils/cn"
import { LoaderCircleIcon } from "lucide-react"
import type { ComponentProps } from "react"

type Props = ComponentProps<"button"> & { isPending?: boolean }

export const GradientButton = ({
  className,
  children,
  isPending,
  ...props
}: Props) => (
  <button
    className={cn(
      "group relative inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded bg-primary px-3 py-2 font-medium text-inverted text-sm transition-colors hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform",
      className,
    )}
    type="button"
    {...props}
  >
    {isPending && <LoaderCircleIcon className="animate-spin" />}
    {children}
    <span className="-bottom-[2px] absolute inset-x-0 block h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 transition group-hover:opacity-100" />
    <span className="-bottom-[2px] absolute inset-x-10 mx-aut1block h-[2px] w-1/2 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 blur-sm transition group-hover:opacity-100" />
  </button>
)
