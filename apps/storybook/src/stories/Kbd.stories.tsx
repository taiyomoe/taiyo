import preview from "@/storybook/preview"
import { Kbd, KbdGroup } from "@taiyomoe/ui/components/ui/kbd"

const meta = preview.meta({
  title: "UI/Kbd",
  component: Kbd,
  subcomponents: { KbdGroup },
  parameters: { layout: "centered" },
})

export const Default = meta.story({
  args: { children: "⌘" },
})

export const WithModifiers = meta.story({
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
})

export const Combinations = meta.story({
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>⇧</Kbd>
        <Kbd>⌘</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span className="text-xs text-muted-foreground">+</span>
        <Kbd>Alt</Kbd>
        <span className="text-xs text-muted-foreground">+</span>
        <Kbd>Del</Kbd>
      </KbdGroup>
    </div>
  ),
})
