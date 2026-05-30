import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Button } from "@taiyomoe/ui/components/button"
import { Input } from "@taiyomoe/ui/components/input"
import { Label } from "@taiyomoe/ui/components/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  type Side,
} from "@taiyomoe/ui/components/sheet"
import { useState } from "react"

type SheetStoryProps = React.ComponentProps<typeof Sheet> & { side?: Side }

const meta = {
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
  },
  parameters: { layout: "centered" },
  argTypes: {
    disablePointerDismissal: { control: "boolean" },
    side: {
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
    },
  },
  args: {},
} satisfies Meta<SheetStoryProps>

export default meta
type Story = StoryObj<SheetStoryProps>

export const Default: Story = {
  args: {
    disablePointerDismissal: true,
    side: "right",
  },
  render: ({ side, ...args }) => {
    const [open, setOpen] = useState(args.open ?? false)

    return (
      <Sheet {...args} open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
        <SheetContent open={open} side={side}>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="sheet-default-name">Name</Label>
              <Input id="sheet-default-name" defaultValue="John Doe" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-default-username">Username</Label>
              <Input id="sheet-default-username" defaultValue="@john-doe" />
            </div>
          </div>
          <SheetFooter className="flex-row gap-2">
            <Button className="w-2/3" type="submit">
              Save changes
            </Button>
            <SheetClose render={<Button className="w-1/3" variant="outline" />}>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  },
}

export const Dismissible: Story = {
  args: {
    disablePointerDismissal: false,
    side: "right",
  },
  render: ({ side, ...args }) => {
    const [open, setOpen] = useState(args.open ?? false)

    return (
      <Sheet {...args} open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
        <SheetContent open={open} side={side}>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="sheet-default-name">Name</Label>
              <Input id="sheet-default-name" defaultValue="John Doe" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-default-username">Username</Label>
              <Input id="sheet-default-username" defaultValue="@john-doe" />
            </div>
          </div>
          <SheetFooter className="flex-row gap-2">
            <Button className="w-2/3" type="submit">
              Save changes
            </Button>
            <SheetClose render={<Button className="w-1/3" variant="outline" />}>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  },
}

export const Sides: Story = {
  args: {
    disablePointerDismissal: true,
    side: "left",
  },
  render: ({ side, ...args }) => {
    const [open, setOpen] = useState(args.open ?? false)

    return (
      <Sheet {...args} open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline" />}>Open {side}</SheetTrigger>
        <SheetContent open={open} side={side}>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="sheet-default-name">Name</Label>
              <Input id="sheet-default-name" defaultValue="John Doe" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-default-username">Username</Label>
              <Input id="sheet-default-username" defaultValue="@john-doe" />
            </div>
          </div>
          <SheetFooter className="flex-row gap-2">
            <Button className="w-2/3" type="submit">
              Save changes
            </Button>
            <SheetClose render={<Button className="w-1/3" variant="outline" />}>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  },
}
