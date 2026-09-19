import * as stylex from "@stylexjs/stylex"
import preview from "@/storybook/preview"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { fn } from "storybook/test"

const styles = stylex.create({
  anchor: {
    width: "20rem",
  },
  column: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    width: "20rem",
  },
})
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
    <div sx={styles.anchor}>
      <Textarea {...args} />
    </div>
  ),
})

export const Default = meta.story({})

export const Sizes = meta.story({
  render: () => (
    <div sx={styles.column}>
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
