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

const meta = preview.meta({
  title: "UI/Frame",
  component: Frame,
  parameters: { layout: "centered" },
  render: () => (
    <Frame className="w-96">
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
    <Frame className="w-96">
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
    <Frame className="w-96">
      <FramePanel className="p-0">
        <FrameHeader>
          <FrameTitle>Display name</FrameTitle>
          <FrameDescription>This is the name that will be shown to other users.</FrameDescription>
        </FrameHeader>
        <FrameFooter className="flex items-center justify-between border-t bg-muted/40">
          <FrameDescription>Max 32 characters.</FrameDescription>
          <Button size="sm">Save</Button>
        </FrameFooter>
      </FramePanel>
    </Frame>
  ),
})
