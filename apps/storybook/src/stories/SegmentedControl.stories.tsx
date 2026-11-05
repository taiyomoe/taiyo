import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import { fn } from "storybook/test"
import preview from "@/storybook/preview"

const meta = preview.meta({
  title: "UI/SegmentedControl",
  component: SegmentedControl,
  subcomponents: { SegmentedControlItem },
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
  args: { onValueChange: fn() },
  render: (args) => (
    <SegmentedControl aria-label="Page display" defaultValue="single" {...args}>
      <SegmentedControlItem value="single">Single</SegmentedControlItem>
      <SegmentedControlItem value="double">Double</SegmentedControlItem>
      <SegmentedControlItem value="strip">Long strip</SegmentedControlItem>
    </SegmentedControl>
  ),
})

export const Default = meta.story({})

export const Small = meta.story({
  render: (args) => (
    <SegmentedControl aria-label="Image fit" defaultValue="screen" {...args}>
      <SegmentedControlItem size="sm" value="screen">
        Screen
      </SegmentedControlItem>
      <SegmentedControlItem size="sm" value="height">
        Height
      </SegmentedControlItem>
      <SegmentedControlItem size="sm" value="width">
        Width
      </SegmentedControlItem>
    </SegmentedControl>
  ),
})

export const Disabled = meta.story({ args: { disabled: true } })
