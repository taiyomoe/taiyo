import * as stylex from "@stylexjs/stylex"
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

const styles = stylex.create({
  column: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    width: "20rem",
  },
  row: {
    gap: "0.5rem",
    display: "flex",
    justifyContent: "flex-end",
  },
})
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
    <Form {...args} sx={styles.column}>
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
    <Form sx={styles.column} onFormSubmit={fn()}>
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
      <div sx={styles.row}>
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
    <Form sx={styles.column} errors={{ email: "This email is already taken." }} onFormSubmit={fn()}>
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl render={<Input defaultValue="ada@example.com" type="email" />} />
        <FieldError />
      </Field>
      <Button type="submit">Submit</Button>
    </Form>
  ),
})
