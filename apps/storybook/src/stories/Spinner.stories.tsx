import preview from "@/storybook/preview"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"

const meta = preview.meta({
  title: "UI/Spinner",
  component: Spinner,
  parameters: { layout: "centered" },
})

export const Default = meta.story({})

export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Spinner className="size-3" />
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
      <Spinner className="size-12" />
    </div>
  ),
})

export const Colors = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Spinner className="text-foreground" />
      <Spinner className="text-primary" />
      <Spinner className="text-muted-foreground" />
      <Spinner className="text-destructive" />
    </div>
  ),
})
