import preview from "@/storybook/preview"
import { Label } from "@taiyomoe/ui/components/ui/label"
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@taiyomoe/ui/components/ui/number-field"
import { fn } from "storybook/test"

type NumberFieldStoryProps = React.ComponentProps<typeof NumberField>

const meta = preview.meta({
  title: "UI/NumberField",
  component: NumberField,
  subcomponents: {
    NumberFieldGroup,
    NumberFieldDecrement,
    NumberFieldIncrement,
    NumberFieldInput,
    NumberFieldScrubArea,
  },
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
  args: { onValueChange: fn() },
  render: (args: NumberFieldStoryProps) => (
    <div className="w-56">
      <NumberField {...args}>
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  ),
})

export const Default = meta.story({
  args: { defaultValue: 0 },
})

export const Sizes = meta.story({
  render: () => (
    <div className="flex w-56 flex-col gap-3">
      <NumberField defaultValue={1} size="sm">
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
      <NumberField defaultValue={2} size="default">
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
      <NumberField defaultValue={3} size="lg">
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  ),
})

export const WithMinMax = meta.story({
  args: { defaultValue: 5, min: 0, max: 10 },
})

export const WithStep = meta.story({
  args: { defaultValue: 0, step: 0.5 },
})

export const Disabled = meta.story({
  args: { defaultValue: 0, disabled: true },
})

export const ReadOnly = meta.story({
  args: { defaultValue: 42, readOnly: true },
})

export const Invalid = meta.story({
  render: () => (
    <div className="w-56">
      <NumberField defaultValue={-1}>
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput aria-invalid />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  ),
})

export const WithLabel = meta.story({
  render: () => (
    <div className="w-56">
      <NumberField defaultValue={1}>
        <Label htmlFor="quantity">Quantity</Label>
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput id="quantity" />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  ),
})

export const WithScrubArea = meta.story({
  render: () => (
    <div className="w-56">
      <NumberField defaultValue={50}>
        <NumberFieldScrubArea label="Volume" />
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  ),
})
