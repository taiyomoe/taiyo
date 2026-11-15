import * as stylex from "@stylexjs/stylex"
import { TimeInput } from "@taiyomoe/ui/components/ui/time-input"
import { useState } from "react"
import { fn } from "storybook/test"
import preview from "@/storybook/preview"

const styles = stylex.create({
  anchor: {
    width: "14rem",
  },
})
const labels = { field: "Time", hour: "Hour", minute: "Minute", open: "Open time picker" }
const meta = preview.meta({
  title: "UI/TimeInput",
  component: TimeInput,
  parameters: { layout: "centered" },
  argTypes: {
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { labels, onValueChange: fn(), value: "14:30" },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)

    return (
      <div sx={styles.anchor}>
        <TimeInput
          {...args}
          onValueChange={(next) => {
            setValue(next)
            args.onValueChange(next)
          }}
          value={value}
        />
      </div>
    )
  },
})

export const Default = meta.story()

export const Invalid = meta.story({ args: { invalid: true } })

export const Disabled = meta.story({ args: { disabled: true } })
