import * as stylex from "@stylexjs/stylex"
import { ColorPicker } from "@taiyomoe/ui/components/ui/color-picker"
import { useState } from "react"
import { fn } from "storybook/test"
import preview from "@/storybook/preview"

const styles = stylex.create({
  anchor: {
    width: "16rem",
  },
})
const meta = preview.meta({
  title: "UI/ColorPicker",
  component: ColorPicker,
  parameters: { layout: "centered" },
  args: { value: "#f2452d", onChange: fn(), "aria-label": "Color" },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)

    return (
      <ColorPicker
        {...args}
        onChange={(next) => {
          setValue(next)
          args.onChange(next)
        }}
        sx={styles.anchor}
        value={value}
      />
    )
  },
})

export const Default = meta.story({})

export const WithPresets = meta.story({
  args: {
    value: "#000000",
    presets: [
      "#000000",
      "#161616",
      "#2b2b2b",
      "#3a3a3a",
      "#1c2230",
      "#2a2420",
      "#f4f1ea",
      "#ffffff",
    ],
  },
})
