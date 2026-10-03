import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import preview from "@/storybook/preview"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"

const styles = stylex.create({
  wrap: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  icon: {
    height: "0.75rem",
    width: "0.75rem",
  },
  icon2: {
    height: "1rem",
    width: "1rem",
  },
  icon3: {
    height: "1.5rem",
    width: "1.5rem",
  },
  icon4: {
    height: "2rem",
    width: "2rem",
  },
  icon5: {
    height: "3rem",
    width: "3rem",
  },
  text: {
    color: colors.foreground,
  },
  text2: {
    color: colors.primary,
  },
  caption: {
    color: colors.mutedForeground,
  },
  text3: {
    color: colors.destructive,
  },
})
const meta = preview.meta({
  title: "UI/Spinner",
  component: Spinner,
  parameters: { layout: "centered" },
})

export const Default = meta.story({})

export const Sizes = meta.story({
  render: () => (
    <div sx={styles.wrap}>
      <Spinner sx={styles.icon} />
      <Spinner sx={styles.icon2} />
      <Spinner sx={styles.icon3} />
      <Spinner sx={styles.icon4} />
      <Spinner sx={styles.icon5} />
    </div>
  ),
})

export const Colors = meta.story({
  render: () => (
    <div sx={styles.wrap}>
      <Spinner sx={styles.text} />
      <Spinner sx={styles.text2} />
      <Spinner sx={styles.caption} />
      <Spinner sx={styles.text3} />
    </div>
  ),
})
