import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import preview from "@/storybook/preview"
import { Separator } from "@taiyomoe/ui/components/ui/separator"

const styles = stylex.create({
  anchor: {
    width: "16rem",
  },
  column: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1,
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  spacing: {
    marginBlock: "1rem",
  },
  row: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    height: "1.25rem",
  },
  row2: {
    gap: "1.5rem",
    alignItems: "stretch",
    display: "flex",
  },
  column2: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  caption2: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  column3: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    width: "10rem",
  },
  text: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  row3: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    height: "4rem",
  },
})
const meta = preview.meta({
  title: "UI/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
  render: (args) => (
    <div sx={styles.anchor}>
      <div sx={styles.column}>
        <h4 sx={styles.label}>Radix Primitives</h4>
        <p sx={styles.caption}>An open-source UI component library.</p>
      </div>
      <Separator {...args} sx={styles.spacing} />
      <div sx={styles.row}>
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
})

export const Default = meta.story({})

export const Orientations = meta.story({
  render: () => (
    <div sx={styles.row2}>
      <div sx={styles.column2}>
        <span sx={styles.caption2}>Horizontal</span>
        <div sx={styles.column3}>
          <p sx={styles.text}>Above</p>
          <Separator orientation="horizontal" />
          <p sx={styles.text}>Below</p>
        </div>
      </div>
      <div sx={styles.column2}>
        <span sx={styles.caption2}>Vertical</span>
        <div sx={styles.row3}>
          <span sx={styles.text}>Left</span>
          <Separator orientation="vertical" />
          <span sx={styles.text}>Right</span>
        </div>
      </div>
    </div>
  ),
})
