import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { SettingsIcon, TrashIcon } from "lucide-react"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "destructive-outline",
        "ghost",
        "link",
        "outline",
        "secondary",
      ],
    },
    size: {
      control: "select",
      options: [
        "xs",
        "sm",
        "default",
        "lg",
        "xl",
        "icon-xs",
        "icon-sm",
        "icon",
        "icon-lg",
        "icon-xl",
      ],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { onClick: fn() },
})

export const Default = meta.story({
  args: { children: "Button" },
})

export const Variants = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="destructive-outline">Destructive Outline</Button>
    </div>
  ),
})

export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="default">Default</Button>
      <Button size="lg">LG</Button>
      <Button size="xl">XL</Button>
    </div>
  ),
})

export const IconSizes = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="icon-xs" aria-label="Settings">
        <SettingsIcon />
      </Button>
      <Button size="icon-sm" aria-label="Settings">
        <SettingsIcon />
      </Button>
      <Button size="icon" aria-label="Settings">
        <SettingsIcon />
      </Button>
      <Button size="icon-lg" aria-label="Settings">
        <SettingsIcon />
      </Button>
      <Button size="icon-xl" aria-label="Settings">
        <SettingsIcon />
      </Button>
    </div>
  ),
})

export const Disabled = meta.story({
  args: { disabled: true, children: "Button" },
})

export const Loading = meta.story({
  args: { loading: true, children: "Button" },
})

export const WithIcon = meta.story({
  args: {
    children: (
      <>
        <SettingsIcon />
        Settings
      </>
    ),
  },
})

export const IconOnly = meta.story({
  args: {
    size: "icon",
    "aria-label": "Delete",
    children: <TrashIcon />,
  },
})
