import { extendVariants } from "@nextui-org/react"
import { Select as BaseSelect } from "@nextui-org/select"

export const Select = extendVariants(BaseSelect, {
  variants: {
    labelPlacement: {
      "outside-left": {
        label: "min-w-[100px] mr-6",
        mainWrapper: "w-full",
      },
    },
    color: {
      danger: {
        label: "dark:text-danger",
      },
    },
  },
  defaultVariants: {
    labelPlacement: "outside-left",
  },
})
