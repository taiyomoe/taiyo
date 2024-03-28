import { Textarea as BaseTextArea } from "@nextui-org/input"
import { extendVariants } from "@nextui-org/react"

export const TextArea = extendVariants(BaseTextArea, {
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
    labelPlacement: "outside",
  },
})
