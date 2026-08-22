import preview from "@/storybook/preview"
import { Separator } from "@taiyomoe/ui/components/ui/separator"

const meta = preview.meta({
  title: "UI/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
  render: (args) => (
    <div className="w-64">
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">An open-source UI component library.</p>
      </div>
      <Separator {...args} className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
})

export const Default = meta.story({})

export const Orientations = meta.story({
  render: () => (
    <div className="flex items-stretch gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Horizontal</span>
        <div className="w-40 space-y-3">
          <p className="text-sm">Above</p>
          <Separator orientation="horizontal" />
          <p className="text-sm">Below</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Vertical</span>
        <div className="flex h-16 items-center gap-3">
          <span className="text-sm">Left</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Right</span>
        </div>
      </div>
    </div>
  ),
})
