import preview from "@/storybook/preview"
import { Badge } from "@taiyomoe/ui/components/ui/badge"

const meta = preview.meta({
  title: "UI/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "error",
        "info",
        "success",
        "warning",
      ],
    },
  },
  args: { children: "Badge" },
})

export const Default = meta.story({})

export const Variants = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
    </div>
  ),
})

export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
})
