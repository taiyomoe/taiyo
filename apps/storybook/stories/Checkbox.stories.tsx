import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Checkbox } from "@taiyomoe/ui/components/checkbox"
import { fn } from "storybook/test"

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
  },
  args: { title: "Checkbox", onCheckedChange: fn() },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
