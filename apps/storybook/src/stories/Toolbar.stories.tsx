import preview from "@/storybook/preview"
import { Button, buttonVariants } from "@taiyomoe/ui/components/ui/button"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarSeparator,
} from "@taiyomoe/ui/components/ui/toolbar"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  Link2Icon,
  UnderlineIcon,
} from "lucide-react"

const meta = preview.meta({
  title: "UI/Toolbar",
  component: Toolbar,
  subcomponents: {
    ToolbarButton,
    ToolbarLink,
    ToolbarInput,
    ToolbarGroup,
    ToolbarSeparator,
  },
  parameters: { layout: "centered" },
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    disabled: { control: "boolean" },
    loopFocus: { control: "boolean" },
  },
})

export const Default = meta.story({
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton render={<Button variant="ghost" />}>
        <BoldIcon /> Bold
      </ToolbarButton>
      <ToolbarButton render={<Button variant="ghost" />}>
        <ItalicIcon /> Italic
      </ToolbarButton>
      <ToolbarButton render={<Button variant="ghost" />}>
        <UnderlineIcon /> Underline
      </ToolbarButton>
    </Toolbar>
  ),
})

export const WithSeparator = meta.story({
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton aria-label="Align left" render={<Button size="icon-sm" variant="ghost" />}>
        <AlignLeftIcon />
      </ToolbarButton>
      <ToolbarButton aria-label="Align center" render={<Button size="icon-sm" variant="ghost" />}>
        <AlignCenterIcon />
      </ToolbarButton>
      <ToolbarButton aria-label="Align right" render={<Button size="icon-sm" variant="ghost" />}>
        <AlignRightIcon />
      </ToolbarButton>
      <ToolbarSeparator orientation="vertical" />
      <ToolbarButton aria-label="Bold" render={<Button size="icon-sm" variant="ghost" />}>
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton aria-label="Italic" render={<Button size="icon-sm" variant="ghost" />}>
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton aria-label="Underline" render={<Button size="icon-sm" variant="ghost" />}>
        <UnderlineIcon />
      </ToolbarButton>
    </Toolbar>
  ),
})

export const WithGroup = meta.story({
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup>
        <ToolbarButton aria-label="Bold" render={<Button size="icon-sm" variant="ghost" />}>
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Italic" render={<Button size="icon-sm" variant="ghost" />}>
          <ItalicIcon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator orientation="vertical" />
      <ToolbarGroup>
        <ToolbarButton aria-label="Align left" render={<Button size="icon-sm" variant="ghost" />}>
          <AlignLeftIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Align center" render={<Button size="icon-sm" variant="ghost" />}>
          <AlignCenterIcon />
        </ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  ),
})

export const WithInputAndLink = meta.story({
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarInput placeholder="Search…" render={<Input />} />
      <ToolbarSeparator orientation="vertical" />
      <ToolbarLink className={buttonVariants({ size: "sm", variant: "ghost" })} href="#">
        <Link2Icon /> Docs
      </ToolbarLink>
    </Toolbar>
  ),
})

export const Vertical = meta.story({
  args: { orientation: "vertical" },
  render: (args) => (
    <Toolbar {...args} className="flex-col">
      <ToolbarButton aria-label="Bold" render={<Button size="icon-sm" variant="ghost" />}>
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton aria-label="Italic" render={<Button size="icon-sm" variant="ghost" />}>
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarSeparator orientation="horizontal" />
      <ToolbarButton aria-label="Underline" render={<Button size="icon-sm" variant="ghost" />}>
        <UnderlineIcon />
      </ToolbarButton>
    </Toolbar>
  ),
})

export const Disabled = meta.story({
  args: { disabled: true },
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton render={<Button variant="ghost" />}>
        <BoldIcon /> Bold
      </ToolbarButton>
      <ToolbarButton render={<Button variant="ghost" />}>
        <ItalicIcon /> Italic
      </ToolbarButton>
      <ToolbarButton render={<Button variant="ghost" />}>
        <UnderlineIcon /> Underline
      </ToolbarButton>
    </Toolbar>
  ),
})
