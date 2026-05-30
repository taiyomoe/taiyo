import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "@taiyomoe/ui/components/input"
import { useState } from "react"
import { fn } from "storybook/test"

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: { onChange: fn() },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
}

export const Hover: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <p className="min-w-24 text-primary">Hover</p>
        <Input placeholder="Hover over me..." />
      </div>
      <p className="text-muted text-sm">Hover over the input to see the hover state</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Input hover state demonstration",
      },
    },
  },
}

export const Focused: Story = {
  render: () => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-6">
          <p className="min-w-24 text-primary">Focused</p>
          <Input
            placeholder="Click to focus..."
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={isFocused ? "ring-2 ring-primary" : ""}
          />
        </div>
        <p className="text-muted text-sm">Status: {isFocused ? "Focused" : "Not focused"}</p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: "Input in focused state with visual feedback",
      },
    },
  },
}
