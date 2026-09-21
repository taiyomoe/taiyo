import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import preview from "@/storybook/preview"
import { Kbd, KbdGroup } from "@taiyomoe/ui/components/ui/kbd"

const styles = stylex.create({
  column: {
    gap: "0.75rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
})
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
    <div sx={styles.column}>
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
        <span sx={styles.caption}>+</span>
        <Kbd>Alt</Kbd>
        <span sx={styles.caption}>+</span>
        <Kbd>Del</Kbd>
      </KbdGroup>
    </div>
  ),
})
