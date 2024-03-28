import { Input as BaseInput } from "@nextui-org/input"
import { extendVariants } from "@nextui-org/react"

export const Input = extendVariants(BaseInput, {
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
        input: "dark:text-danger",
      },
    },
  },
  defaultVariants: {
    labelPlacement: "outside-left",
  },
})
