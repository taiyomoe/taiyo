import preview from "@/storybook/preview"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "file"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
    unstyled: { control: "boolean" },
    nativeInput: { control: "boolean" },
  },
  args: { onChange: fn() },
  render: (args) => (
    <div className="w-72">
      <Input {...args} />
    </div>
  ),
})

export const Default = meta.story({
  args: { placeholder: "Enter text..." },
})

export const Sizes = meta.story({
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input placeholder="Small" size="sm" />
      <Input placeholder="Default" size="default" />
      <Input placeholder="Large" size="lg" />
    </div>
  ),
})

export const Types = meta.story({
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input placeholder="Text" type="text" />
      <Input placeholder="you@example.com" type="email" />
      <Input placeholder="Password" type="password" />
      <Input placeholder="Number" type="number" />
      <Input placeholder="Search…" type="search" />
      <Input type="file" />
    </div>
  ),
})

export const Disabled = meta.story({
  args: { placeholder: "Disabled input", disabled: true },
})

export const Invalid = meta.story({
  args: { placeholder: "Invalid input", "aria-invalid": true },
})

export const Unstyled = meta.story({
  args: { placeholder: "Unstyled input", unstyled: true },
})

export const NativeInput = meta.story({
  args: { placeholder: "Native input element", nativeInput: true },
})
