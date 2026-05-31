import preview from "@/storybook/preview"
import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@taiyomoe/ui/components/ui/meter"

const meta = preview.meta({
  title: "UI/Meter",
  component: Meter,
  parameters: { layout: "centered" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    min: { control: "number" },
    max: { control: "number" },
  },
  args: { value: 75 },
  render: (args) => (
    <div className="w-72">
      <Meter {...args} />
    </div>
  ),
})

export const Default = meta.story({})

export const Empty = meta.story({ args: { value: 0 } })

export const Full = meta.story({ args: { value: 100 } })

export const WithLabel = meta.story({
  args: { value: 42 },
  render: (args) => (
    <div className="w-72">
      <Meter {...args}>
        <MeterLabel>Storage used</MeterLabel>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  ),
})

export const WithValue = meta.story({
  args: { value: 42 },
  render: (args) => (
    <div className="w-72">
      <Meter {...args}>
        <div className="flex items-center justify-between">
          <MeterLabel>Storage used</MeterLabel>
          <MeterValue />
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  ),
})

export const Formatted = meta.story({
  args: {
    value: 42,
    format: { style: "percent" },
  },
  render: (args) => (
    <div className="w-72">
      <Meter {...args} max={100}>
        <div className="flex items-center justify-between">
          <MeterLabel>Disk usage</MeterLabel>
          <MeterValue />
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  ),
})

export const CustomRange = meta.story({
  args: { value: 6, min: 0, max: 10 },
  render: (args) => (
    <div className="w-72">
      <Meter {...args}>
        <div className="flex items-center justify-between">
          <MeterLabel>Rating</MeterLabel>
          <MeterValue />
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  ),
})
