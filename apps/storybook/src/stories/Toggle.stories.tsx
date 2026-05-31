import preview from "@/storybook/preview"
import { Toggle } from "@taiyomoe/ui/components/ui/toggle"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Toggle",
  component: Toggle,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "outline"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
    },
    disabled: { control: "boolean" },
    defaultPressed: { control: "boolean" },
  },
  args: { onPressedChange: fn() },
})

export const Default = meta.story({
  args: { children: "Toggle" },
})

export const Variants = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle variant="default">Default</Toggle>
      <Toggle variant="outline">Outline</Toggle>
    </div>
  ),
})

export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle size="sm" variant="outline">
        Small
      </Toggle>
      <Toggle size="default" variant="outline">
        Default
      </Toggle>
      <Toggle size="lg" variant="outline">
        Large
      </Toggle>
    </div>
  ),
})

export const Pressed = meta.story({
  args: { defaultPressed: true, children: "Pressed" },
})

export const Disabled = meta.story({
  args: { disabled: true, children: "Disabled" },
})

export const WithIcon = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Bold" variant="outline">
        <BoldIcon />
      </Toggle>
      <Toggle aria-label="Italic" variant="outline">
        <ItalicIcon />
      </Toggle>
      <Toggle aria-label="Underline" variant="outline">
        <UnderlineIcon />
      </Toggle>
    </div>
  ),
})
