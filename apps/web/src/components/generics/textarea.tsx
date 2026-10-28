import { Textarea as BaseTextArea } from "@nextui-org/input"
import { extendVariants } from "@nextui-org/react"

// extendVariants types `ref` as Ref<ReactElement>, which rejects react-hook-form refs under React 19
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
}) as typeof BaseTextArea
