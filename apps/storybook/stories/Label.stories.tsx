import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Checkbox } from "@taiyomoe/ui/components/checkbox"
import { Label } from "@taiyomoe/ui/components/label"
import { fn } from "storybook/test"

const meta = {
  title: "UI/Label",
  component: Checkbox,
  subcomponents: { Label },
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
  },
  args: { onCheckedChange: fn() },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-default" {...args} />
      <Label htmlFor="checkbox-default">Accept terms and conditions</Label>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-disabled" {...args} />
      <Label htmlFor="checkbox-disabled">Disabled option</Label>
    </div>
  ),
}
