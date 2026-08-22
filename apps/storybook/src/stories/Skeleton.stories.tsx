import preview from "@/storybook/preview"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"

const meta = preview.meta({
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
  render: (args) => <Skeleton className="h-4 w-48" {...args} />,
})

export const Default = meta.story({})

export const Composition = meta.story({
  render: () => (
    <div className="flex w-72 items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ),
})

export const Card = meta.story({
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  ),
})
