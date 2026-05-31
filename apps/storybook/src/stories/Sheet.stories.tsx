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
  },
})

export const Default = meta.story({
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
      <SheetContent side="right">
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
          <SheetClose render={<Button className="w-1/3" variant="outline" />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
})

export const Sides = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="outline" />}>Open {side}</SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Open from {side}</SheetTitle>
              <SheetDescription>This sheet enters from the {side}.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
})

export const Inset = meta.story({
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
      <SheetContent side="right" variant="inset">
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
          <SheetClose render={<Button className="w-1/3" variant="outline" />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
})

export const WithoutCloseButton = meta.story({
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
      <SheetContent showCloseButton={false} side="right">
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
          <SheetClose render={<Button className="w-1/3" variant="outline" />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
})

export const NonDismissible = meta.story({
  render: () => (
    <Sheet disablePointerDismissal>
      <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
      <SheetContent side="right">
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
          <SheetClose render={<Button className="w-1/3" variant="outline" />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
})
