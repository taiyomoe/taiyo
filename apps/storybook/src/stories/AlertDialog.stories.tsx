import preview from "@/storybook/preview"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@taiyomoe/ui/components/ui/alert-dialog"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/AlertDialog",
  component: AlertDialog,
  subcomponents: {
    AlertDialogTrigger,
    AlertDialogPopup,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogClose,
  },
  parameters: { layout: "centered" },
  args: { onOpenChange: fn() },
})

export const Default = meta.story({
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Delete account
      </AlertDialogTrigger>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your account and all associated data will be permanently
            removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>Cancel</AlertDialogClose>
          <AlertDialogClose render={<Button variant="destructive" />}>Delete</AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  ),
})

export const BareFooter = meta.story({
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Delete account
      </AlertDialogTrigger>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your account and all associated data will be permanently
            removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter variant="bare">
          <AlertDialogClose render={<Button variant="outline" />}>Cancel</AlertDialogClose>
          <AlertDialogClose render={<Button variant="destructive" />}>Delete</AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  ),
})

export const NoMobileStick = meta.story({
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Delete account
      </AlertDialogTrigger>
      <AlertDialogPopup bottomStickOnMobile={false}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your account and all associated data will be permanently
            removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>Cancel</AlertDialogClose>
          <AlertDialogClose render={<Button variant="destructive" />}>Delete</AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  ),
})
