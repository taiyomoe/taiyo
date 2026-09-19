import * as stylex from "@stylexjs/stylex"
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

const styles = stylex.create({
  column: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    width: "18rem",
  },
  column2: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  grid: {
    gap: "0.75rem",
    display: "grid",
  },
  grid2: {
    gap: "0.75rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  cell: {
    gridColumnEnd: "span 2",
    gridColumnStart: "span 2",
  },
  wrap: {
    gap: "4rem",
    display: "flex",
    flexWrap: "wrap",
  },
  wrap2: {
    gap: "3rem",
    display: "flex",
    flexWrap: "wrap",
  },
})
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
        <div sx={styles.column}>
          <div sx={styles.column2}>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </div>
          <div sx={styles.grid}>
            <div sx={styles.grid2}>
              <Label htmlFor="popover-width">Width</Label>
              <Input sx={styles.cell} defaultValue="100%" id="popover-width" />
            </div>
            <div sx={styles.grid2}>
              <Label htmlFor="popover-height">Height</Label>
              <Input sx={styles.cell} defaultValue="25px" id="popover-height" />
            </div>
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  ),
})

export const Sides = meta.story({
  render: () => (
    <div sx={styles.wrap}>
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
    <div sx={styles.wrap2}>
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
        <div sx={styles.column}>
          <div sx={styles.column2}>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </div>
          <div sx={styles.grid}>
            <div sx={styles.grid2}>
              <Label htmlFor="popover-width-modal">Width</Label>
              <Input sx={styles.cell} defaultValue="100%" id="popover-width-modal" />
            </div>
            <div sx={styles.grid2}>
              <Label htmlFor="popover-height-modal">Height</Label>
              <Input sx={styles.cell} defaultValue="25px" id="popover-height-modal" />
            </div>
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  ),
})
