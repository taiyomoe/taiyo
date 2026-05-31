import preview from "@/storybook/preview"
import { Label } from "@taiyomoe/ui/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@taiyomoe/ui/components/ui/radio-group"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/RadioGroup",
  component: RadioGroup,
  subcomponents: { RadioGroupItem },
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
  args: { onValueChange: fn() },
  render: (args) => (
    <RadioGroup {...args} defaultValue={args.defaultValue ?? "comfortable"}>
      <Label className="flex items-center gap-2">
        <RadioGroupItem value="default" />
        Default
      </Label>
      <Label className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" />
        Comfortable
      </Label>
      <Label className="flex items-center gap-2">
        <RadioGroupItem value="compact" />
        Compact
      </Label>
    </RadioGroup>
  ),
})

export const Default = meta.story({})

export const SelectedByDefault = meta.story({
  args: { defaultValue: "compact" },
})

export const Disabled = meta.story({ args: { disabled: true } })

export const ReadOnly = meta.story({ args: { readOnly: true } })

export const Invalid = meta.story({
  render: () => (
    <RadioGroup aria-invalid defaultValue="comfortable" onValueChange={fn()}>
      <Label className="flex items-center gap-2">
        <RadioGroupItem aria-invalid value="default" />
        Default
      </Label>
      <Label className="flex items-center gap-2">
        <RadioGroupItem aria-invalid value="comfortable" />
        Comfortable
      </Label>
      <Label className="flex items-center gap-2">
        <RadioGroupItem aria-invalid value="compact" />
        Compact
      </Label>
    </RadioGroup>
  ),
})

export const Horizontal = meta.story({
  render: () => (
    <RadioGroup className="flex-row gap-4" defaultValue="comfortable" onValueChange={fn()}>
      <Label className="flex items-center gap-2">
        <RadioGroupItem value="default" />
        Default
      </Label>
      <Label className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" />
        Comfortable
      </Label>
      <Label className="flex items-center gap-2">
        <RadioGroupItem value="compact" />
        Compact
      </Label>
    </RadioGroup>
  ),
})
