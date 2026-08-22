import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@taiyomoe/ui/components/ui/field"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Form",
  component: Form,
  parameters: { layout: "centered" },
  argTypes: {
    validationMode: {
      control: "select",
      options: ["onSubmit", "onBlur", "onChange"],
    },
  },
  args: { onFormSubmit: fn() },
  render: (args) => (
    <Form {...args} className="flex w-80 flex-col gap-4">
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl render={<Input placeholder="you@example.com" type="email" />} required />
        <FieldError match="valueMissing">An email is required.</FieldError>
        <FieldError match="typeMismatch">Please enter a valid email address.</FieldError>
      </Field>
      <Button type="submit">Submit</Button>
    </Form>
  ),
})

export const Default = meta.story({})

export const Composition = meta.story({
  render: () => (
    <Form className="flex w-80 flex-col gap-4" onFormSubmit={fn()}>
      <Field name="username">
        <FieldLabel>Username</FieldLabel>
        <FieldControl render={<Input placeholder="taiyo_user" />} required />
        <FieldDescription>This will be your public handle.</FieldDescription>
        <FieldError match="valueMissing">A username is required.</FieldError>
      </Field>
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl render={<Input placeholder="you@example.com" type="email" />} required />
        <FieldError match="valueMissing">An email is required.</FieldError>
        <FieldError match="typeMismatch">Please enter a valid email address.</FieldError>
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="reset" variant="outline">
          Reset
        </Button>
        <Button type="submit">Create account</Button>
      </div>
    </Form>
  ),
})

export const WithServerErrors = meta.story({
  render: () => (
    <Form
      className="flex w-80 flex-col gap-4"
      errors={{ email: "This email is already taken." }}
      onFormSubmit={fn()}
    >
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl render={<Input defaultValue="ada@example.com" type="email" />} />
        <FieldError />
      </Field>
      <Button type="submit">Submit</Button>
    </Form>
  ),
})
