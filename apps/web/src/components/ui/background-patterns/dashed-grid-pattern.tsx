import type { HTMLAttributes } from "react"
import { cn } from "~/lib/utils/cn"
import { GridPattern } from "./grid-pattern"

export const DashedGridPattern = ({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative flex h-full w-full items-center justify-center overflow-hidden bg-background p-20",
      className,
    )}
    {...rest}
  >
    <GridPattern
      width={30}
      height={30}
      x={-1}
      y={-1}
      strokeDasharray={"4 2"}
      className="[mask-image:radial-gradient(at_right_top,var(--background)_-100%,transparent)]"
    />
  </div>
)
