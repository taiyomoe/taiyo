import * as stylex from "@stylexjs/stylex"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import preview from "@/storybook/preview"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"

const styles = stylex.create({
  block: {
    height: "1rem",
    width: "12rem",
  },
  row: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    width: "18rem",
  },
  surface: {
    borderRadius: radius.full,
    height: "3rem",
    width: "3rem",
  },
  column: {
    flex: "1",
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  block2: {
    height: "1rem",
    width: "100%",
  },
  block3: {
    height: "1rem",
    width: "66.666667%",
  },
  column2: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    width: "18rem",
  },
  surface2: {
    borderRadius: radius.lg,
    height: "10rem",
    width: "100%",
  },
  block4: {
    height: "1.25rem",
    width: "75%",
  },
  block5: {
    height: "1rem",
    width: "83.333333%",
  },
})
const meta = preview.meta({
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
  render: (args) => <Skeleton sx={styles.block} {...args} />,
})

export const Default = meta.story({})

export const Composition = meta.story({
  render: () => (
    <div sx={styles.row}>
      <Skeleton sx={styles.surface} />
      <div sx={styles.column}>
        <Skeleton sx={styles.block2} />
        <Skeleton sx={styles.block3} />
      </div>
    </div>
  ),
})

export const Card = meta.story({
  render: () => (
    <div sx={styles.column2}>
      <Skeleton sx={styles.surface2} />
      <Skeleton sx={styles.block4} />
      <Skeleton sx={styles.block2} />
      <Skeleton sx={styles.block5} />
    </div>
  ),
})
