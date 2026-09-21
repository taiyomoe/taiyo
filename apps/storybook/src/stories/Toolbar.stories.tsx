import * as stylex from "@stylexjs/stylex"
import {
  Link02Icon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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

const styles = stylex.create({
  column: {
    flexDirection: "column",
  },
})
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
        <HugeiconsIcon icon={TextBoldIcon} /> Bold
      </ToolbarButton>
      <ToolbarButton render={<Button variant="ghost" />}>
        <HugeiconsIcon icon={TextItalicIcon} /> Italic
      </ToolbarButton>
      <ToolbarButton render={<Button variant="ghost" />}>
        <HugeiconsIcon icon={TextUnderlineIcon} /> Underline
      </ToolbarButton>
    </Toolbar>
  ),
})

export const WithSeparator = meta.story({
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton aria-label="Align left" render={<Button size="icon-sm" variant="ghost" />}>
        <HugeiconsIcon icon={TextAlignLeftIcon} />
      </ToolbarButton>
      <ToolbarButton aria-label="Align center" render={<Button size="icon-sm" variant="ghost" />}>
        <HugeiconsIcon icon={TextAlignCenterIcon} />
      </ToolbarButton>
      <ToolbarButton aria-label="Align right" render={<Button size="icon-sm" variant="ghost" />}>
        <HugeiconsIcon icon={TextAlignRightIcon} />
      </ToolbarButton>
      <ToolbarSeparator orientation="vertical" />
      <ToolbarButton aria-label="Bold" render={<Button size="icon-sm" variant="ghost" />}>
        <HugeiconsIcon icon={TextBoldIcon} />
      </ToolbarButton>
      <ToolbarButton aria-label="Italic" render={<Button size="icon-sm" variant="ghost" />}>
        <HugeiconsIcon icon={TextItalicIcon} />
      </ToolbarButton>
      <ToolbarButton aria-label="Underline" render={<Button size="icon-sm" variant="ghost" />}>
        <HugeiconsIcon icon={TextUnderlineIcon} />
      </ToolbarButton>
    </Toolbar>
  ),
})

export const WithGroup = meta.story({
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup>
        <ToolbarButton aria-label="Bold" render={<Button size="icon-sm" variant="ghost" />}>
          <HugeiconsIcon icon={TextBoldIcon} />
        </ToolbarButton>
        <ToolbarButton aria-label="Italic" render={<Button size="icon-sm" variant="ghost" />}>
          <HugeiconsIcon icon={TextItalicIcon} />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator orientation="vertical" />
      <ToolbarGroup>
        <ToolbarButton aria-label="Align left" render={<Button size="icon-sm" variant="ghost" />}>
          <HugeiconsIcon icon={TextAlignLeftIcon} />
        </ToolbarButton>
        <ToolbarButton aria-label="Align center" render={<Button size="icon-sm" variant="ghost" />}>
          <HugeiconsIcon icon={TextAlignCenterIcon} />
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
        <HugeiconsIcon icon={Link02Icon} /> Docs
      </ToolbarLink>
    </Toolbar>
  ),
})

export const Vertical = meta.story({
  args: { orientation: "vertical" },
  render: (args) => (
    <Toolbar {...args} sx={styles.column}>
      <ToolbarButton aria-label="Bold" render={<Button size="icon-sm" variant="ghost" />}>
        <HugeiconsIcon icon={TextBoldIcon} />
      </ToolbarButton>
      <ToolbarButton aria-label="Italic" render={<Button size="icon-sm" variant="ghost" />}>
        <HugeiconsIcon icon={TextItalicIcon} />
      </ToolbarButton>
      <ToolbarSeparator orientation="horizontal" />
      <ToolbarButton aria-label="Underline" render={<Button size="icon-sm" variant="ghost" />}>
        <HugeiconsIcon icon={TextUnderlineIcon} />
      </ToolbarButton>
    </Toolbar>
  ),
})

export const Disabled = meta.story({
  args: { disabled: true },
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton render={<Button variant="ghost" />}>
        <HugeiconsIcon icon={TextBoldIcon} /> Bold
      </ToolbarButton>
      <ToolbarButton render={<Button variant="ghost" />}>
        <HugeiconsIcon icon={TextItalicIcon} /> Italic
      </ToolbarButton>
      <ToolbarButton render={<Button variant="ghost" />}>
        <HugeiconsIcon icon={TextUnderlineIcon} /> Underline
      </ToolbarButton>
    </Toolbar>
  ),
})
