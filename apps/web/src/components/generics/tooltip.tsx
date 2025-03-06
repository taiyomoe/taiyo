import { extendVariants } from "@heroui/react"
import { Tooltip as BaseTooltip } from "@heroui/tooltip"

export const Tooltip = extendVariants(BaseTooltip, {
  variants: {
    shadow: {
      lg: {
        content:
          "scrollbar-thin scrollbar-track-content2 scrollbar-thumb-primary flex max-h-80 w-[unset] max-w-64 flex-row flex-wrap gap-2 overflow-y-auto border border-default-200 p-2 break-all",
      },
    },
  },
  defaultVariants: {
    shadow: "lg",
  },
})
