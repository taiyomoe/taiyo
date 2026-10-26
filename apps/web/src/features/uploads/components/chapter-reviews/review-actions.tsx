import { Button } from "@taiyomoe/ui/components/ui/button"
import { DialogClose, DialogFooter } from "@taiyomoe/ui/components/ui/dialog"
import { m } from "@/paraglide/messages"

type ReviewActionsProps = {
  rejecting: boolean
  pending: boolean
  approveDisabled: boolean
  onCancelReject: () => void
  onStartReject: () => void
  onReject: () => void
  onApprove: () => void
}

export function ReviewActions({
  rejecting,
  pending,
  approveDisabled,
  onCancelReject,
  onStartReject,
  onReject,
  onApprove,
}: ReviewActionsProps) {
  return (
    <DialogFooter>
      {rejecting ? (
        <>
          <Button onClick={onCancelReject} variant="outline">
            {m.cancel()}
          </Button>
          <Button disabled={pending} onClick={onReject} variant="destructive">
            {m.review_reject()}
          </Button>
        </>
      ) : (
        <>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button onClick={onStartReject} variant="outline">
            {m.review_reject()}
          </Button>
          <Button disabled={approveDisabled} onClick={onApprove}>
            {m.review_approve()}
          </Button>
        </>
      )}
    </DialogFooter>
  )
}
