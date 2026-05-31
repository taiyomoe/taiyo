import preview from "@/storybook/preview"
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@taiyomoe/ui/components/ui/progress"

const meta = preview.meta({
  title: "UI/Progress",
  component: Progress,
  subcomponents: {
    ProgressLabel,
    ProgressTrack,
    ProgressIndicator,
    ProgressValue,
  },
  parameters: { layout: "centered" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    min: { control: "number" },
    max: { control: "number" },
  },
  args: { value: 60 },
  render: (args) => (
    <div className="w-72">
      <Progress {...args} />
    </div>
  ),
})

export const Default = meta.story({})

export const Empty = meta.story({ args: { value: 0 } })

export const Half = meta.story({ args: { value: 50 } })

export const Full = meta.story({ args: { value: 100 } })

export const Indeterminate = meta.story({ args: { value: null } })

export const WithLabel = meta.story({
  args: { value: 42 },
  render: (args) => (
    <div className="w-72">
      <Progress {...args}>
        <ProgressLabel>Uploading</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  ),
})

export const WithValue = meta.story({
  args: { value: 42 },
  render: (args) => (
    <div className="w-72">
      <Progress {...args}>
        <div className="flex items-center justify-between">
          <ProgressLabel>Uploading</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  ),
})

export const CustomRange = meta.story({
  args: { value: 6, min: 0, max: 10 },
  render: (args) => (
    <div className="w-72">
      <Progress {...args}>
        <div className="flex items-center justify-between">
          <ProgressLabel>Steps</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  ),
})
