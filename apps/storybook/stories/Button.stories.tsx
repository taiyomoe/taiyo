import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Button } from "@taiyomoe/ui/components/button"
import { EditIcon, SettingsIcon, TrashIcon } from "lucide-react"
import { fn } from "storybook/test"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    color: { control: "select", options: ["default"] },
    variant: { control: "select", options: ["solid", "outline", "ghost"] },
    className: { control: "text" },
    isPending: { control: "boolean" },
    disabled: { control: "boolean" },
    asChild: { control: "boolean" },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// 1. Three variants in default state
export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All button variants in default state",
      },
    },
  },
}

// 2. Three variants in loading state
export const Loading: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="solid" isPending>
        Solid Loading
      </Button>
      <Button variant="outline" isPending>
        Outline Loading
      </Button>
      <Button variant="ghost" isPending>
        Ghost Loading
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All button variants in loading state",
      },
    },
  },
}

// 3. Three variants as icon-only buttons
export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="solid" className="size-9 p-0">
        <SettingsIcon />
      </Button>
      <Button variant="outline" className="size-9 p-0">
        <EditIcon />
      </Button>
      <Button variant="ghost" className="size-9 p-0">
        <TrashIcon />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All button variants as icon-only buttons",
      },
    },
  },
}

// 4. Complete overview - every variant and every state
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="solid">Solid</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="solid" disabled>
          Solid Disabled
        </Button>
        <Button variant="outline" disabled>
          Outline Disabled
        </Button>
        <Button variant="ghost" disabled>
          Ghost Disabled
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="solid" isPending>
          Solid Loading
        </Button>
        <Button variant="outline" isPending>
          Outline Loading
        </Button>
        <Button variant="ghost" isPending>
          Ghost Loading
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="solid" className="size-9 p-0">
          <SettingsIcon />
        </Button>
        <Button variant="outline" className="size-9 p-0">
          <EditIcon />
        </Button>
        <Button variant="ghost" className="size-9 p-0">
          <TrashIcon />
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complete overview of all button variants and states",
      },
    },
  },
}
