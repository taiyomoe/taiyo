import { Meter as BaseMeter } from "@base-ui-components/react"
import type { ComponentProps } from "react"
import { cn } from "../utils/cn"
import { labelVariants } from "./label"

export const Meter = ({ className, children, ...props }: ComponentProps<typeof BaseMeter.Root>) => (
  <BaseMeter.Root
    className={cn("box-border grid w-48 grid-cols-2 gap-y-2", className)}
    data-slot="meter"
    {...props}
  >
    <BaseMeter.Label className={labelVariants()} data-slot="meter-label">
      {children}
    </BaseMeter.Label>
    <BaseMeter.Value
      className={labelVariants({ className: "text-right text-subtle" })}
      data-slot="meter-value"
    />
    <BaseMeter.Track
      className="col-span-2 block h-3 w-full overflow-hidden rounded-full bg-muted shadow-[inset_0_0_0_1px] shadow-subtle"
      data-slot="meter-track"
    >
      <BaseMeter.Indicator
        className="block bg-primary transition-all duration-500"
        data-slot="meter-indicator"
      />
    </BaseMeter.Track>
  </BaseMeter.Root>
)
