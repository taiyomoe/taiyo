import * as stylex from "@stylexjs/stylex"
import preview from "@/storybook/preview"
import { Slider, SliderValue } from "@taiyomoe/ui/components/ui/slider"
import { fn } from "storybook/test"

const styles = stylex.create({
  anchor: {
    width: "18rem",
  },
  row: {
    alignItems: "center",
    display: "flex",
    height: "16rem",
  },
  column: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    width: "18rem",
  },
})
const meta = preview.meta({
  title: "UI/Slider",
  component: Slider,
  parameters: { layout: "centered" },
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    disabled: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
  },
  args: { onValueChange: fn(), onValueCommitted: fn() },
  render: (args) => (
    <div sx={styles.anchor}>
      <Slider {...args} />
    </div>
  ),
})

export const Default = meta.story({
  args: { defaultValue: [50] },
})

export const Range = meta.story({
  args: { defaultValue: [25, 75] },
})

export const Vertical = meta.story({
  args: { defaultValue: [30], orientation: "vertical" },
  render: (args) => (
    <div sx={styles.row}>
      <Slider {...args} />
    </div>
  ),
})

export const Disabled = meta.story({
  args: { defaultValue: [75], disabled: true },
})

export const WithValue = meta.story({
  args: { defaultValue: [42] },
  render: (args) => (
    <div sx={styles.column}>
      <Slider {...args}>
        <SliderValue />
      </Slider>
    </div>
  ),
})
