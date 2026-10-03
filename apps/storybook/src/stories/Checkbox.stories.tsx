import preview from "@/storybook/preview"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
  args: { onCheckedChange: fn() },
})

export const Default = meta.story({})

export const Checked = meta.story({ args: { defaultChecked: true } })

export const Indeterminate = meta.story({ args: { indeterminate: true } })

export const Disabled = meta.story({ args: { disabled: true } })

export const Invalid = meta.story({ args: { "aria-invalid": true } })
