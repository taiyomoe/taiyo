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
import { ErrorAlert } from "@/components/feedback/error-alert"
import { m } from "@/paraglide/messages"

export type Confirmation = {
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  run: () => Promise<unknown>
}

export function ConfirmDialog({
  confirmation,
  error,
  pending,
  onClose,
}: {
  confirmation: Confirmation | null
  error: string | null
  pending: boolean
  onClose: () => void
}) {
  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={confirmation !== null}
    >
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmation?.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirmation?.description}</AlertDialogDescription>
          <ErrorAlert message={error} />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>{m.cancel()}</AlertDialogClose>
          <Button
            disabled={pending}
            onClick={() => {
              void confirmation
                ?.run()
                .then(onClose)
                .catch(() => {})
            }}
            variant={confirmation?.destructive === true ? "destructive" : "default"}
          >
            {confirmation?.confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  )
}
