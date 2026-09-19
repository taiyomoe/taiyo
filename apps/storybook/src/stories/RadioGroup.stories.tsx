import * as stylex from "@stylexjs/stylex"
import preview from "@/storybook/preview"
import { Label } from "@taiyomoe/ui/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@taiyomoe/ui/components/ui/radio-group"
import { fn } from "storybook/test"

const styles = stylex.create({
  row: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  row2: {
    gap: "1rem",
    flexDirection: "row",
  },
})
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
      <Label sx={styles.row}>
        <RadioGroupItem value="default" />
        Default
      </Label>
      <Label sx={styles.row}>
        <RadioGroupItem value="comfortable" />
        Comfortable
      </Label>
      <Label sx={styles.row}>
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
      <Label sx={styles.row}>
        <RadioGroupItem aria-invalid value="default" />
        Default
      </Label>
      <Label sx={styles.row}>
        <RadioGroupItem aria-invalid value="comfortable" />
        Comfortable
      </Label>
      <Label sx={styles.row}>
        <RadioGroupItem aria-invalid value="compact" />
        Compact
      </Label>
    </RadioGroup>
  ),
})

export const Horizontal = meta.story({
  render: () => (
    <RadioGroup sx={styles.row2} defaultValue="comfortable" onValueChange={fn()}>
      <Label sx={styles.row}>
        <RadioGroupItem value="default" />
        Default
      </Label>
      <Label sx={styles.row}>
        <RadioGroupItem value="comfortable" />
        Comfortable
      </Label>
      <Label sx={styles.row}>
        <RadioGroupItem value="compact" />
        Compact
      </Label>
    </RadioGroup>
  ),
})
