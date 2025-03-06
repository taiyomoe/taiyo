import { Textarea as BaseTextArea } from "@heroui/input"
import { extendVariants } from "@heroui/react"

export const TextArea = extendVariants(BaseTextArea, {
  variants: {
    labelPlacement: {
      outside: {
        label: "z-0",
      },
      "outside-left": {
        label: "min-w-[100px] mr-6 z-0",
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
