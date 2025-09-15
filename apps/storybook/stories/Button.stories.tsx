import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Button } from "@taiyomoe/ui/components/button"
import { SettingsIcon, TrashIcon } from "lucide-react"
import { fn } from "storybook/test"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    color: { control: "select", options: ["default", "secondary"] },
    variant: { control: "select", options: ["solid", "outline", "ghost"] },
    size: { control: "select", options: ["default", "icon"] },
    className: { control: "text" },
    isPending: { control: "boolean" },
    disabled: { control: "boolean" },
    asChild: { control: "boolean" },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Button",
  },
}

export const Pending: Story = {
  args: {
    isPending: true,
    children: "Button",
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Button",
  },
}

export const Icons: Story = {
  args: {
    children: (
      <>
        <SettingsIcon />
        Settings
      </>
    ),
  },
}

export const IconOnly: Story = {
  args: {
    size: "icon",
    children: <TrashIcon />,
  },
}
