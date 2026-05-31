import preview from "@/storybook/preview"
import { Field, FieldControl, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Fieldset, FieldsetLegend } from "@taiyomoe/ui/components/ui/fieldset"
import { Input } from "@taiyomoe/ui/components/ui/input"

const meta = preview.meta({
  title: "UI/Fieldset",
  component: Fieldset,
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
  },
  render: (args) => (
    <Fieldset {...args} className="flex w-80 flex-col gap-4">
      <FieldsetLegend>Profile</FieldsetLegend>
      <Field>
        <FieldLabel>First name</FieldLabel>
        <FieldControl render={<Input placeholder="Ada" />} />
      </Field>
      <Field>
        <FieldLabel>Last name</FieldLabel>
        <FieldControl render={<Input placeholder="Lovelace" />} />
      </Field>
    </Fieldset>
  ),
})

export const Default = meta.story({})

export const Composition = meta.story({
  render: () => (
    <Fieldset className="flex w-80 flex-col gap-4">
      <FieldsetLegend>Contact information</FieldsetLegend>
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl render={<Input placeholder="you@example.com" type="email" />} />
        <FieldDescription>We'll only use this to send account notifications.</FieldDescription>
      </Field>
      <Field name="phone">
        <FieldLabel>Phone</FieldLabel>
        <FieldControl render={<Input placeholder="+1 555 010 0100" />} />
      </Field>
    </Fieldset>
  ),
})

export const Disabled = meta.story({
  args: { disabled: true },
})
