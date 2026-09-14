import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import preview from "@/storybook/preview"
import { Toggle } from "@taiyomoe/ui/components/ui/toggle"
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
        <HugeiconsIcon icon={TextBoldIcon} />
      </Toggle>
      <Toggle aria-label="Italic" variant="outline">
        <HugeiconsIcon icon={TextItalicIcon} />
      </Toggle>
      <Toggle aria-label="Underline" variant="outline">
        <HugeiconsIcon icon={TextUnderlineIcon} />
      </Toggle>
    </div>
  ),
})
