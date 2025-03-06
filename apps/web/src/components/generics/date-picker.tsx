import { DatePicker as BaseDatePicker } from "@heroui/date-picker"
import { extendVariants } from "@heroui/react"

export const DatePicker = extendVariants(BaseDatePicker, {
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
})
