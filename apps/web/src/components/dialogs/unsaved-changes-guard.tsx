import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@taiyomoe/ui/components/ui/alert-dialog"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useBlocker } from "@tanstack/react-router"
import { m } from "@/paraglide/messages"

export function UnsavedChangesGuard({ dirty }: { dirty: boolean }) {
  const blocker = useBlocker({
    shouldBlockFn: () => dirty,
    enableBeforeUnload: () => dirty,
    withResolver: true,
  })

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open && blocker.status === "blocked") {
          blocker.reset()
        }
      }}
      open={blocker.status === "blocked"}
    >
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.unsaved_changes_title()}</AlertDialogTitle>
          <AlertDialogDescription>{m.unsaved_changes_description()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>
            {m.unsaved_changes_keep()}
          </AlertDialogClose>
          <Button
            onClick={() => {
              if (blocker.status === "blocked") {
                blocker.proceed()
              }
            }}
            variant="destructive"
          >
            {m.unsaved_changes_discard()}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  )
}
