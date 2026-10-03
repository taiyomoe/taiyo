import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import preview from "@/storybook/preview"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@taiyomoe/ui/components/ui/preview-card"
import { fn } from "storybook/test"

const styles = stylex.create({
  link: {
    fontWeight: 500,
    textDecorationLine: { default: "none", ":hover": "underline" },
    textUnderlineOffset: "4px",
  },
  column: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  surface: {
    borderRadius: radius.full,
    backgroundColor: colors.muted,
    height: "2.5rem",
    width: "2.5rem",
  },
  column2: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontWeight: 600,
    lineHeight: 1,
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  text: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  wrap: {
    gap: "3rem",
    display: "flex",
    flexWrap: "wrap",
  },
})
const meta = preview.meta({
  title: "UI/PreviewCard",
  component: PreviewCard,
  subcomponents: { PreviewCardTrigger, PreviewCardPopup },
  parameters: { layout: "centered" },
  args: {
    onOpenChange: fn(),
  },
})

export const Default = meta.story({
  render: (args) => (
    <PreviewCard {...args}>
      <PreviewCardTrigger
        sx={styles.link}
        href="https://github.com/taiyomoe"
        rel="noreferrer"
        target="_blank"
      >
        @taiyomoe
      </PreviewCardTrigger>
      <PreviewCardPopup align="center">
        <div sx={styles.column}>
          <div sx={styles.surface} />
          <div sx={styles.column2}>
            <p sx={styles.title}>Taiyō</p>
            <p sx={styles.caption}>@taiyomoe</p>
          </div>
          <p sx={styles.text}>
            A community-built reading platform — manga, manhwa, and more, all in one place.
          </p>
        </div>
      </PreviewCardPopup>
    </PreviewCard>
  ),
})

export const Alignment = meta.story({
  render: () => (
    <div sx={styles.wrap}>
      {(["start", "center", "end"] as const).map((align) => (
        <PreviewCard defaultOpen key={align}>
          <PreviewCardTrigger sx={styles.link}>{align}</PreviewCardTrigger>
          <PreviewCardPopup align={align}>
            <p sx={styles.text}>Aligned to {align}</p>
          </PreviewCardPopup>
        </PreviewCard>
      ))}
    </div>
  ),
})

export const InstantOpen = meta.story({
  render: (args) => (
    <PreviewCard {...args}>
      <PreviewCardTrigger
        sx={styles.link}
        closeDelay={0}
        delay={0}
        href="https://github.com/taiyomoe"
        rel="noreferrer"
        target="_blank"
      >
        @taiyomoe
      </PreviewCardTrigger>
      <PreviewCardPopup align="center">
        <div sx={styles.column}>
          <div sx={styles.surface} />
          <div sx={styles.column2}>
            <p sx={styles.title}>Taiyō</p>
            <p sx={styles.caption}>@taiyomoe</p>
          </div>
          <p sx={styles.text}>
            A community-built reading platform — manga, manhwa, and more, all in one place.
          </p>
        </div>
      </PreviewCardPopup>
    </PreviewCard>
  ),
})
