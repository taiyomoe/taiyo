import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Label } from "@taiyomoe/ui/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetTrigger,
} from "@taiyomoe/ui/components/ui/sheet"

type SheetSide = "top" | "right" | "bottom" | "left"
type SheetVariant = "default" | "inset"

type SheetStoryProps = React.ComponentProps<typeof Sheet> & {
  side?: SheetSide
  variant?: SheetVariant
  showCloseButton?: boolean
}

const ProfileSheet = ({
  side,
  variant,
  showCloseButton,
  ...args
}: SheetStoryProps) => (
  <Sheet {...args}>
    <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
    <SheetContent
      showCloseButton={showCloseButton}
      side={side}
      variant={variant}
    >
      <SheetHeader>
        <SheetTitle>Edit profile</SheetTitle>
        <SheetDescription>
          Make changes to your profile here. Click save when you&apos;re done.
        </SheetDescription>
      </SheetHeader>
      <SheetPanel>
        <div className="grid auto-rows-min gap-6">
          <div className="grid gap-3">
            <Label htmlFor="sheet-name">Name</Label>
            <Input defaultValue="John Doe" id="sheet-name" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-username">Username</Label>
            <Input defaultValue="@john-doe" id="sheet-username" />
          </div>
        </div>
      </SheetPanel>
      <SheetFooter className="flex-row gap-2">
        <Button className="w-2/3" type="submit">
          Save changes
        </Button>
        <SheetClose render={<Button className="w-1/3" variant="outline" />}>
          Close
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)
const meta = preview.meta({
  title: "UI/Sheet",
  component: Sheet,
  subcomponents: {
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
    SheetPanel,
  },
  parameters: { layout: "centered" },
  argTypes: {
    disablePointerDismissal: { control: "boolean" },
    showCloseButton: { control: "boolean" },
    side: {
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
    },
    variant: {
      control: { type: "select" },
      options: ["default", "inset"],
    },
  },
  render: (args: SheetStoryProps) => <ProfileSheet {...args} />,
})

export const Default = meta.story({ args: { side: "right" } })

export const Left = meta.story({ args: { side: "left" } })

export const Top = meta.story({ args: { side: "top" } })

export const Bottom = meta.story({ args: { side: "bottom" } })

export const Inset = meta.story({ args: { side: "right", variant: "inset" } })

export const WithoutCloseButton = meta.story({
  args: { side: "right", showCloseButton: false },
})

export const NonDismissible = meta.story({
  args: { side: "right", disablePointerDismissal: true },
})
