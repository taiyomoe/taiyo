import { Checkbox as BaseCheckbox } from "@base-ui-components/react/checkbox"
import { CheckIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "../utils/cn"

export const Checkbox = ({
  className,
  ...props
}: ComponentProps<typeof BaseCheckbox.Root>) => (
  <BaseCheckbox.Root
    className={cn(
      "group peer flex size-5 items-center justify-center gap-2 rounded-[0.25rem] border bg-muted transition checked:border-primary checked:bg-primary hover:cursor-pointer hover:not-disabled:not-checked:border-emphasis active:scale-[0.98]",
      "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    data-slot="checkbox"
    {...props}
  >
    <BaseCheckbox.Indicator data-slot="checkbox-indicator">
      <CheckIcon className="size-3.5 stroke-3 text-inverted" />
    </BaseCheckbox.Indicator>
  </BaseCheckbox.Root>
)
