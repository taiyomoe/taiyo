import preview from "@/storybook/preview"
import { ScrollArea } from "@taiyomoe/ui/components/ui/scroll-area"
import { Separator } from "@taiyomoe/ui/components/ui/separator"

const TAGS = Array.from({ length: 50 }).map((_, i) => `Tag ${i + 1}`)
const meta = preview.meta({
  title: "UI/ScrollArea",
  component: ScrollArea,
  parameters: { layout: "centered" },
  argTypes: {
    scrollFade: { control: "boolean" },
    scrollbarGutter: { control: "boolean" },
    fill: { control: "boolean" },
  },
  render: (args) => (
    <ScrollArea {...args} className="h-64 w-56 rounded-md border bg-background p-4">
      <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
      {TAGS.map((tag) => (
        <div key={tag}>
          <div className="text-sm">{tag}</div>
          <Separator className="my-2" />
        </div>
      ))}
    </ScrollArea>
  ),
})

export const Default = meta.story({})

export const WithScrollFade = meta.story({ args: { scrollFade: true } })

export const WithScrollbarGutter = meta.story({
  args: { scrollbarGutter: true },
})

export const Horizontal = meta.story({
  render: () => (
    <ScrollArea className="w-72 rounded-md border bg-background whitespace-nowrap">
      <div className="flex w-max gap-2 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: showcase content
            key={i}
            className="flex size-24 shrink-0 items-center justify-center rounded-md bg-muted text-sm"
          >
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
})
