import * as stylex from "@stylexjs/stylex"
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

const styles = stylex.create({
  grid: {
    gap: "1.5rem",
    display: "grid",
    gridAutoRows: "min-content",
  },
  grid2: {
    gap: "0.75rem",
    display: "grid",
  },
  row: {
    gap: "0.5rem",
    flexDirection: "row",
  },
  anchor: {
    width: "66.666667%",
  },
  anchor2: {
    width: "33.333333%",
  },
  wrap: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
})
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
          <div sx={styles.grid}>
            <div sx={styles.grid2}>
              <Label htmlFor="sheet-name">Name</Label>
              <Input defaultValue="John Doe" id="sheet-name" />
            </div>
            <div sx={styles.grid2}>
              <Label htmlFor="sheet-username">Username</Label>
              <Input defaultValue="@john-doe" id="sheet-username" />
            </div>
          </div>
        </SheetPanel>
        <SheetFooter sx={styles.row}>
          <Button sx={styles.anchor} type="submit">
            Save changes
          </Button>
          <SheetClose render={<Button sx={styles.anchor2} variant="outline" />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
})

export const Sides = meta.story({
  render: () => (
    <div sx={styles.wrap}>
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
          <div sx={styles.grid}>
            <div sx={styles.grid2}>
              <Label htmlFor="sheet-name">Name</Label>
              <Input defaultValue="John Doe" id="sheet-name" />
            </div>
            <div sx={styles.grid2}>
              <Label htmlFor="sheet-username">Username</Label>
              <Input defaultValue="@john-doe" id="sheet-username" />
            </div>
          </div>
        </SheetPanel>
        <SheetFooter sx={styles.row}>
          <Button sx={styles.anchor} type="submit">
            Save changes
          </Button>
          <SheetClose render={<Button sx={styles.anchor2} variant="outline" />}>Close</SheetClose>
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
          <div sx={styles.grid}>
            <div sx={styles.grid2}>
              <Label htmlFor="sheet-name">Name</Label>
              <Input defaultValue="John Doe" id="sheet-name" />
            </div>
            <div sx={styles.grid2}>
              <Label htmlFor="sheet-username">Username</Label>
              <Input defaultValue="@john-doe" id="sheet-username" />
            </div>
          </div>
        </SheetPanel>
        <SheetFooter sx={styles.row}>
          <Button sx={styles.anchor} type="submit">
            Save changes
          </Button>
          <SheetClose render={<Button sx={styles.anchor2} variant="outline" />}>Close</SheetClose>
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
          <div sx={styles.grid}>
            <div sx={styles.grid2}>
              <Label htmlFor="sheet-name">Name</Label>
              <Input defaultValue="John Doe" id="sheet-name" />
            </div>
            <div sx={styles.grid2}>
              <Label htmlFor="sheet-username">Username</Label>
              <Input defaultValue="@john-doe" id="sheet-username" />
            </div>
          </div>
        </SheetPanel>
        <SheetFooter sx={styles.row}>
          <Button sx={styles.anchor} type="submit">
            Save changes
          </Button>
          <SheetClose render={<Button sx={styles.anchor2} variant="outline" />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
})
