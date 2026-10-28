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
} from "@taiyomoe/ui/components/ui/dialog"
import { RejectNoteField } from "@/features/uploads/components/chapter-reviews/reject-note-field"
import { m } from "@/paraglide/messages"

export function BulkRejectDialog({
  open,
  reason,
  touched,
  pending,
  onClose,
  onReasonChange,
  onSubmit,
}: {
  open: boolean
  reason: string
  touched: boolean
  pending: boolean
  onClose: () => void
  onReasonChange: (reason: string) => void
  onSubmit: () => void
}) {
  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
      open={open}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.review_bulk_reject_title()}</DialogTitle>
          <DialogDescription>{m.review_bulk_reject_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <RejectNoteField
            onReasonChange={onReasonChange}
            reason={reason}
            rows={4}
            touched={touched}
          />
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button disabled={pending} onClick={onSubmit} variant="destructive">
            {m.review_reject_selected()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
