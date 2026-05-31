import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardFrame,
  CardFrameDescription,
  CardFrameFooter,
  CardFrameHeader,
  CardFrameTitle,
  CardHeader,
  CardTitle,
} from "@taiyomoe/ui/components/ui/card"

const meta = preview.meta({
  title: "UI/Card",
  component: Card,
  subcomponents: {
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
    CardFrame,
    CardFrameHeader,
    CardFrameTitle,
    CardFrameDescription,
    CardFrameFooter,
  },
  parameters: { layout: "centered" },
})

export const Default = meta.story({
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your library.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Use the form below to access your account and pick up where you left off.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Sign in</Button>
      </CardFooter>
    </Card>
  ),
})

export const WithAction = meta.story({
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage how you receive updates.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">You have 3 unread notifications.</p>
      </CardContent>
    </Card>
  ),
})

export const Frame = meta.story({
  render: () => (
    <CardFrame className="w-80">
      <CardFrameHeader>
        <CardFrameTitle>Frame title</CardFrameTitle>
        <CardFrameDescription>
          A frame groups stacked sub-cards into a single rounded surface.
        </CardFrameDescription>
      </CardFrameHeader>
      <Card>
        <CardHeader>
          <CardTitle>Nested card</CardTitle>
          <CardDescription>This card is hosted inside a frame.</CardDescription>
        </CardHeader>
      </Card>
      <CardFrameFooter>
        <p className="text-sm text-muted-foreground">Frame footer area</p>
      </CardFrameFooter>
    </CardFrame>
  ),
})
