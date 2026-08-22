import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@taiyomoe/ui/components/ui/tooltip"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Tooltip",
  component: Tooltip,
  subcomponents: { TooltipTrigger, TooltipPopup, TooltipProvider },
  parameters: { layout: "centered" },
  args: { onOpenChange: fn() },
})

export const Default = meta.story({
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
        <TooltipPopup align="center" side="top">
          Add to library
        </TooltipPopup>
      </Tooltip>
    </TooltipProvider>
  ),
})

export const Sides = meta.story({
  render: () => (
    <TooltipProvider>
      <div className="flex flex-wrap gap-16">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <Tooltip defaultOpen key={side}>
            <TooltipTrigger render={<Button variant="outline" />}>{side}</TooltipTrigger>
            <TooltipPopup side={side}>Anchored to {side}</TooltipPopup>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
})

export const Alignment = meta.story({
  render: () => (
    <TooltipProvider>
      <div className="flex flex-wrap gap-12">
        {(["start", "center", "end"] as const).map((align) => (
          <Tooltip defaultOpen key={align}>
            <TooltipTrigger render={<Button variant="outline" />}>{align}</TooltipTrigger>
            <TooltipPopup align={align} side="bottom">
              Aligned to {align}
            </TooltipPopup>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
})

export const DefaultOpen = meta.story({
  render: () => (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
        <TooltipPopup align="center" side="top">
          Shown on mount
        </TooltipPopup>
      </Tooltip>
    </TooltipProvider>
  ),
})

export const Disabled = meta.story({
  render: () => (
    <TooltipProvider>
      <Tooltip disabled>
        <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
        <TooltipPopup align="center" side="top">
          You shouldn't see me
        </TooltipPopup>
      </Tooltip>
    </TooltipProvider>
  ),
})
