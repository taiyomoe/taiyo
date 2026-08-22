import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@taiyomoe/ui/components/ui/drawer"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Label } from "@taiyomoe/ui/components/ui/label"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Drawer",
  component: Drawer,
  subcomponents: {
    DrawerTrigger,
    DrawerClose,
    DrawerPopup,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
    DrawerPanel,
  },
  parameters: { layout: "centered" },
  args: { onOpenChange: fn() },
})

export const Default = meta.story({
  render: () => (
    <Drawer position="bottom">
      <DrawerTrigger render={<Button variant="outline" />}>Open drawer</DrawerTrigger>
      <DrawerPopup position="bottom">
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerPanel>
          <div className="grid auto-rows-min gap-6">
            <div className="grid gap-3">
              <Label htmlFor="drawer-name">Name</Label>
              <Input defaultValue="John Doe" id="drawer-name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="drawer-username">Username</Label>
              <Input defaultValue="@john-doe" id="drawer-username" />
            </div>
          </div>
        </DrawerPanel>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          <Button type="submit">Save changes</Button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  ),
})

export const Positions = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["top", "right", "bottom", "left"] as const).map((position) => (
        <Drawer key={position} position={position}>
          <DrawerTrigger render={<Button variant="outline" />}>Open {position}</DrawerTrigger>
          <DrawerPopup position={position}>
            <DrawerHeader>
              <DrawerTitle>Open from {position}</DrawerTitle>
              <DrawerDescription>This drawer enters from the {position}.</DrawerDescription>
            </DrawerHeader>
          </DrawerPopup>
        </Drawer>
      ))}
    </div>
  ),
})

export const Straight = meta.story({
  render: () => (
    <Drawer position="bottom">
      <DrawerTrigger render={<Button variant="outline" />}>Open drawer</DrawerTrigger>
      <DrawerPopup position="bottom" variant="straight">
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerPanel>
          <div className="grid auto-rows-min gap-6">
            <div className="grid gap-3">
              <Label htmlFor="drawer-name">Name</Label>
              <Input defaultValue="John Doe" id="drawer-name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="drawer-username">Username</Label>
              <Input defaultValue="@john-doe" id="drawer-username" />
            </div>
          </div>
        </DrawerPanel>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          <Button type="submit">Save changes</Button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  ),
})

export const Inset = meta.story({
  render: () => (
    <Drawer position="bottom">
      <DrawerTrigger render={<Button variant="outline" />}>Open drawer</DrawerTrigger>
      <DrawerPopup position="bottom" variant="inset">
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerPanel>
          <div className="grid auto-rows-min gap-6">
            <div className="grid gap-3">
              <Label htmlFor="drawer-name">Name</Label>
              <Input defaultValue="John Doe" id="drawer-name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="drawer-username">Username</Label>
              <Input defaultValue="@john-doe" id="drawer-username" />
            </div>
          </div>
        </DrawerPanel>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          <Button type="submit">Save changes</Button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  ),
})

export const WithBar = meta.story({
  render: () => (
    <Drawer position="bottom">
      <DrawerTrigger render={<Button variant="outline" />}>Open drawer</DrawerTrigger>
      <DrawerPopup position="bottom" showBar>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerPanel>
          <div className="grid auto-rows-min gap-6">
            <div className="grid gap-3">
              <Label htmlFor="drawer-name">Name</Label>
              <Input defaultValue="John Doe" id="drawer-name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="drawer-username">Username</Label>
              <Input defaultValue="@john-doe" id="drawer-username" />
            </div>
          </div>
        </DrawerPanel>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          <Button type="submit">Save changes</Button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  ),
})

export const WithCloseButton = meta.story({
  render: () => (
    <Drawer position="right">
      <DrawerTrigger render={<Button variant="outline" />}>Open drawer</DrawerTrigger>
      <DrawerPopup position="right" showCloseButton>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerPanel>
          <div className="grid auto-rows-min gap-6">
            <div className="grid gap-3">
              <Label htmlFor="drawer-name">Name</Label>
              <Input defaultValue="John Doe" id="drawer-name" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="drawer-username">Username</Label>
              <Input defaultValue="@john-doe" id="drawer-username" />
            </div>
          </div>
        </DrawerPanel>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          <Button type="submit">Save changes</Button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  ),
})
