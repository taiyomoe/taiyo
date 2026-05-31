import preview from "@/storybook/preview"
import {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupSeparator,
} from "@taiyomoe/ui/components/ui/toggle-group"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "lucide-react"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/ToggleGroup",
  component: ToggleGroup,
  subcomponents: { ToggleGroupItem, ToggleGroupSeparator },
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "outline"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
    },
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { onValueChange: fn() },
})

export const Default = meta.story({
  args: { variant: "outline" },
  render: (args) => (
    <ToggleGroup {...args} defaultValue={["left"]}>
      <ToggleGroupItem aria-label="Align left" value="left">
        <AlignLeftIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Align center" value="center">
        <AlignCenterIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Align right" value="right">
        <AlignRightIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
})

export const Multiple = meta.story({
  args: { variant: "outline", multiple: true },
  render: (args) => (
    <ToggleGroup {...args} defaultValue={["bold", "italic"]}>
      <ToggleGroupItem aria-label="Bold" value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Italic" value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Underline" value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
})

export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup defaultValue={["left"]} variant="default">
        <ToggleGroupItem aria-label="Align left" value="left">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align center" value="center">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align right" value="right">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup defaultValue={["left"]} variant="outline">
        <ToggleGroupItem aria-label="Align left" value="left">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align center" value="center">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align right" value="right">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
})

export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup defaultValue={["left"]} size="sm" variant="outline">
        <ToggleGroupItem aria-label="Align left" value="left">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align center" value="center">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align right" value="right">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup defaultValue={["left"]} size="default" variant="outline">
        <ToggleGroupItem aria-label="Align left" value="left">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align center" value="center">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align right" value="right">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup defaultValue={["left"]} size="lg" variant="outline">
        <ToggleGroupItem aria-label="Align left" value="left">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align center" value="center">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Align right" value="right">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
})

export const Vertical = meta.story({
  args: { variant: "outline", orientation: "vertical" },
  render: (args) => (
    <ToggleGroup {...args} defaultValue={["left"]}>
      <ToggleGroupItem aria-label="Align left" value="left">
        <AlignLeftIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Align center" value="center">
        <AlignCenterIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Align right" value="right">
        <AlignRightIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
})

export const WithSeparator = meta.story({
  args: { variant: "outline", multiple: true },
  render: (args) => (
    <ToggleGroup {...args} defaultValue={["bold"]}>
      <ToggleGroupItem aria-label="Bold" value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Italic" value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupSeparator />
      <ToggleGroupItem aria-label="Underline" value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
})

export const Disabled = meta.story({
  args: { variant: "outline", disabled: true },
  render: (args) => (
    <ToggleGroup {...args} defaultValue={["left"]}>
      <ToggleGroupItem aria-label="Align left" value="left">
        <AlignLeftIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Align center" value="center">
        <AlignCenterIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Align right" value="right">
        <AlignRightIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
})
