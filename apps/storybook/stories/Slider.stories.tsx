import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Slider } from "@taiyomoe/ui/components/slider"
import { fn } from "storybook/test"

const meta = {
  title: "UI/Slider",
  component: Slider,
  parameters: { layout: "centered" },
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    disabled: { control: "boolean" },
    min: { control: { type: "number" } },
    max: { control: { type: "number" } },
  },
  args: { onValueCommitted: fn() },
} satisfies Meta<typeof Slider>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
  },
}

export const Orientation: Story = {
  args: {
    defaultValue: [30],
    orientation: "vertical",
    min: 0,
    max: 100,
  },
  render: (args) => (
    <div className="flex h-64 items-center">
      <Slider {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Vertical slider orientation demonstration",
      },
    },
  },
}

export const Range: Story = {
  args: {
    defaultValue: [50, 75],
    min: 30,
    max: 80,
  },
  render: (args) => (
    <div
      className="flex flex-col gap-2 vertical:flex-row vertical:[&>div]:flex-col-reverse"
      data-orientation={args.orientation}
    >
      <div className="flex justify-between">
        <p>{args.min}</p>
        <p>{args.max}</p>
      </div>
      <Slider {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    defaultValue: [75],
    disabled: true,
    min: 0,
    max: 100,
  },
}
