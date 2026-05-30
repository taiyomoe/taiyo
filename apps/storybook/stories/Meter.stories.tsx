import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Meter } from "@taiyomoe/ui/components/meter"

const meta = {
  title: "UI/Meter",
  component: Meter,
  parameters: { layout: "centered" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
  args: { value: 75 },
} satisfies Meta<typeof Meter>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 75,
    children: "Storage Used",
  },
}
