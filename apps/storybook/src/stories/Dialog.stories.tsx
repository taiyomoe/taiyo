import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@taiyomoe/ui/components/ui/dialog"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Label } from "@taiyomoe/ui/components/ui/label"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Dialog",
  component: Dialog,
  subcomponents: {
    DialogTrigger,
    DialogClose,
    DialogPopup,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogPanel,
  },
  parameters: { layout: "centered" },
  args: { onOpenChange: fn() },
})

export const Default = meta.story({
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Edit profile</DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div className="grid auto-rows-min gap-6">
            <div className="grid gap-3">
              <Label htmlFor="dialog-name">Name</Label>
              <Input defaultValue="John Doe" id="dialog-name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="dialog-username">Username</Label>
              <Input defaultValue="@john-doe" id="dialog-username" />
            </div>
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  ),
})

export const WithoutCloseButton = meta.story({
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Edit profile</DialogTrigger>
      <DialogPopup showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div className="grid auto-rows-min gap-6">
            <div className="grid gap-3">
              <Label htmlFor="dialog-name">Name</Label>
              <Input defaultValue="John Doe" id="dialog-name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="dialog-username">Username</Label>
              <Input defaultValue="@john-doe" id="dialog-username" />
            </div>
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  ),
})

export const BareFooter = meta.story({
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Edit profile</DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div className="grid auto-rows-min gap-6">
            <div className="grid gap-3">
              <Label htmlFor="dialog-name">Name</Label>
              <Input defaultValue="John Doe" id="dialog-name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="dialog-username">Username</Label>
              <Input defaultValue="@john-doe" id="dialog-username" />
            </div>
          </div>
        </DialogPanel>
        <DialogFooter variant="bare">
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  ),
})

export const NoMobileStick = meta.story({
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Edit profile</DialogTrigger>
      <DialogPopup bottomStickOnMobile={false}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div className="grid auto-rows-min gap-6">
            <div className="grid gap-3">
              <Label htmlFor="dialog-name">Name</Label>
              <Input defaultValue="John Doe" id="dialog-name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="dialog-username">Username</Label>
              <Input defaultValue="@john-doe" id="dialog-username" />
            </div>
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  ),
})
