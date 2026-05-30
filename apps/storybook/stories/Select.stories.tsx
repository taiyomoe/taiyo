import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/select"
import { fn } from "storybook/test"

const items = [
  { label: "Select font", value: null },
  { label: "Sans-serif", value: "sans" },
  { label: "Serif", value: "serif" },
  { label: "Monospace", value: "mono" },
  { label: "Cursive", value: "cursive" },
]
const meta = {
  title: "UI/Select",
  component: Select,
  subcomponents: { SelectTrigger, SelectValue, SelectContent, SelectItem },
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
  },
  args: { onValueChange: fn() },
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items,
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  args: {
    items,
    disabled: true,
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
    </Select>
  ),
}

export const Multiple: Story = {
  args: {
    items,
    multiple: true,
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}

export const SelectedByDefault: Story = {
  args: {
    items,
    defaultValue: "sans",
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}
