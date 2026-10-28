import { DatePicker as BaseDatePicker } from "@nextui-org/date-picker"
import { extendVariants } from "@nextui-org/react"

// extendVariants types `ref` as Ref<ReactElement>, which rejects react-hook-form refs under React 19
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
}) as typeof BaseDatePicker
