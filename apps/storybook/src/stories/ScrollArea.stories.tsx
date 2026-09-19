import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import preview from "@/storybook/preview"
import { ScrollArea } from "@taiyomoe/ui/components/ui/scroll-area"
import { Separator } from "@taiyomoe/ui/components/ui/separator"

const TAGS = Array.from({ length: 50 }).map((_, i) => `Tag ${i + 1}`)
const styles = stylex.create({
  /** Stand-in for cover art, so each row has something with weight in it. */
  thumbnail: {
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: colors.muted,
    display: "flex",
    flexShrink: 0,
    fontSize: "0.875rem",
    justifyContent: "center",
    height: "6rem",
    width: "6rem",
  },
  surface: {
    padding: "1rem",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.background,
    height: "16rem",
    width: "14rem",
  },
  box: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1,
    marginBottom: "1rem",
  },
  text: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  spacing: {
    marginBlock: "0.5rem",
  },
  surface2: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.background,
    whiteSpace: "nowrap",
    width: "18rem",
  },
  row: {
    padding: "1rem",
    gap: "0.5rem",
    display: "flex",
    width: "max-content",
  },
})
const meta = preview.meta({
  title: "UI/ScrollArea",
  component: ScrollArea,
  parameters: { layout: "centered" },
  argTypes: {
    scrollFade: { control: "boolean" },
    scrollbarGutter: { control: "boolean" },
    fill: { control: "boolean" },
  },
  render: (args) => (
    <ScrollArea {...args} sx={styles.surface}>
      <h4 sx={styles.box}>Tags</h4>
      {TAGS.map((tag) => (
        <div key={tag}>
          <div sx={styles.text}>{tag}</div>
          <Separator sx={styles.spacing} />
        </div>
      ))}
    </ScrollArea>
  ),
})

export const Default = meta.story({})

export const WithScrollFade = meta.story({ args: { scrollFade: true } })

export const WithScrollbarGutter = meta.story({
  args: { scrollbarGutter: true },
})

export const Horizontal = meta.story({
  render: () => (
    <ScrollArea sx={styles.surface2}>
      <div sx={styles.row}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: showcase content
            key={i}
            sx={styles.thumbnail}
          >
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
})
