import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@taiyomoe/ui/components/ui/frame"

const styles = stylex.create({
  anchor: {
    width: "24rem",
  },
  spacing: {
    padding: 0,
  },
  row: {
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.muted} 40%, transparent)`,
    display: "flex",
    justifyContent: "space-between",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
})
const meta = preview.meta({
  title: "UI/Frame",
  component: Frame,
  parameters: { layout: "centered" },
  render: () => (
    <Frame sx={styles.anchor}>
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Account</FrameTitle>
          <FrameDescription>Update your personal details and preferences.</FrameDescription>
        </FrameHeader>
      </FramePanel>
    </Frame>
  ),
})

export const Default = meta.story({})

export const MultiplePanels = meta.story({
  render: () => (
    <Frame sx={styles.anchor}>
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Profile</FrameTitle>
          <FrameDescription>How you appear across the application.</FrameDescription>
        </FrameHeader>
      </FramePanel>
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Notifications</FrameTitle>
          <FrameDescription>Choose which emails you want to receive.</FrameDescription>
        </FrameHeader>
      </FramePanel>
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Danger zone</FrameTitle>
          <FrameDescription>Irreversible actions, handle with care.</FrameDescription>
        </FrameHeader>
      </FramePanel>
    </Frame>
  ),
})

export const WithFooter = meta.story({
  render: () => (
    <Frame sx={styles.anchor}>
      <FramePanel sx={styles.spacing}>
        <FrameHeader>
          <FrameTitle>Display name</FrameTitle>
          <FrameDescription>This is the name that will be shown to other users.</FrameDescription>
        </FrameHeader>
        <FrameFooter sx={styles.row}>
          <FrameDescription>Max 32 characters.</FrameDescription>
          <Button size="sm">Save</Button>
        </FrameFooter>
      </FramePanel>
    </Frame>
  ),
})
