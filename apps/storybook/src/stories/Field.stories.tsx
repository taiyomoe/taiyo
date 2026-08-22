import preview from "@/storybook/preview"
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"

const meta = preview.meta({
  title: "UI/Field",
  component: Field,
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    name: { control: "text" },
  },
  render: (args) => (
    <div className="w-72">
      <Field {...args}>
        <FieldLabel>Email</FieldLabel>
        <FieldControl render={<Input placeholder="you@example.com" />} />
        <FieldDescription>We'll never share your email.</FieldDescription>
      </Field>
    </div>
  ),
})

export const Default = meta.story({})

export const Composition = meta.story({
  render: () => (
    <div className="w-72">
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl render={<Input placeholder="you@example.com" type="email" />} required />
        <FieldDescription>The address you use to sign in to your account.</FieldDescription>
        <FieldError match="valueMissing">An email is required.</FieldError>
        <FieldError match="typeMismatch">Please enter a valid email address.</FieldError>
      </Field>
    </div>
  ),
})

export const Disabled = meta.story({
  args: { disabled: true },
})

export const Invalid = meta.story({
  render: () => (
    <div className="w-72">
      <Field invalid name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl render={<Input defaultValue="not-an-email" type="email" />} />
        <FieldError match>Please enter a valid email address.</FieldError>
      </Field>
    </div>
  ),
})

export const WithDescription = meta.story({
  render: () => (
    <div className="w-72">
      <Field>
        <FieldLabel>Username</FieldLabel>
        <FieldControl render={<Input placeholder="taiyo_user" />} />
        <FieldDescription>
          Letters, numbers and underscores only. Cannot be changed later.
        </FieldDescription>
      </Field>
    </div>
  ),
})
