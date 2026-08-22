import preview from "@/storybook/preview"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    disabled: { control: "boolean" },
    unstyled: { control: "boolean" },
  },
  args: {
    placeholder: "Type your message here...",
    onChange: fn(),
  },
  render: (args) => (
    <div className="w-80">
      <Textarea {...args} />
    </div>
  ),
})

export const Default = meta.story({})

export const Sizes = meta.story({
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Textarea placeholder="Small textarea" size="sm" />
      <Textarea placeholder="Default textarea" size="default" />
      <Textarea placeholder="Large textarea" size="lg" />
    </div>
  ),
})

export const Disabled = meta.story({
  args: { disabled: true, defaultValue: "This field is disabled." },
})

export const Invalid = meta.story({
  args: {
    "aria-invalid": true,
    defaultValue: "This value has a validation error.",
  },
})

export const Unstyled = meta.story({
  args: { unstyled: true },
})
