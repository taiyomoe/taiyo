import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Label } from "@taiyomoe/ui/components/ui/label"
import {
  Popover,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@taiyomoe/ui/components/ui/popover"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Popover",
  component: Popover,
  subcomponents: {
    PopoverTrigger,
    PopoverPopup,
    PopoverTitle,
    PopoverDescription,
  },
  parameters: { layout: "centered" },
  args: { onOpenChange: fn() },
})

export const Default = meta.story({
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverPopup align="center" side="bottom">
        <div className="flex w-72 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="popover-width">Width</Label>
              <Input className="col-span-2" defaultValue="100%" id="popover-width" />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="popover-height">Height</Label>
              <Input className="col-span-2" defaultValue="25px" id="popover-height" />
            </div>
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  ),
})

export const Sides = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-16">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover defaultOpen key={side}>
          <PopoverTrigger render={<Button variant="outline" />}>{side}</PopoverTrigger>
          <PopoverPopup side={side} tooltipStyle>
            Anchored to {side}
          </PopoverPopup>
        </Popover>
      ))}
    </div>
  ),
})

export const Alignment = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-12">
      {(["start", "center", "end"] as const).map((align) => (
        <Popover defaultOpen key={align}>
          <PopoverTrigger render={<Button variant="outline" />}>{align}</PopoverTrigger>
          <PopoverPopup align={align} side="bottom" tooltipStyle>
            Aligned to {align}
          </PopoverPopup>
        </Popover>
      ))}
    </div>
  ),
})

export const TooltipStyle = meta.story({
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverPopup align="center" side="bottom" tooltipStyle>
        <span>Quick contextual hint</span>
      </PopoverPopup>
    </Popover>
  ),
})

export const Modal = meta.story({
  render: () => (
    <Popover modal>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverPopup align="center" side="bottom">
        <div className="flex w-72 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="popover-width-modal">Width</Label>
              <Input className="col-span-2" defaultValue="100%" id="popover-width-modal" />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="popover-height-modal">Height</Label>
              <Input className="col-span-2" defaultValue="25px" id="popover-height-modal" />
            </div>
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  ),
})
