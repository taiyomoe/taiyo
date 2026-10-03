import preview from "@/storybook/preview"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
  args: { onCheckedChange: fn() },
})

export const Default = meta.story({})

export const Checked = meta.story({ args: { defaultChecked: true } })

export const Disabled = meta.story({ args: { disabled: true } })

export const DisabledChecked = meta.story({
  args: { disabled: true, defaultChecked: true },
})
