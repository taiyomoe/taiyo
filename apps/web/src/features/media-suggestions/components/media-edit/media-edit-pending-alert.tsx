import { Info } from "@taiyomoe/ui/components/icons"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { m } from "@/paraglide/messages"

export function MediaEditPendingAlert({
  withdrawing,
  onWithdraw,
}: {
  withdrawing: boolean
  onWithdraw: () => void
}) {
  return (
    <Alert variant="info">
      <Info />
      <AlertTitle>{m.media_edit_pending_title()}</AlertTitle>
      <AlertDescription>{m.media_edit_pending_description()}</AlertDescription>
      <AlertAction>
        <Button disabled={withdrawing} onClick={onWithdraw} size="sm" variant="outline">
          {m.submission_withdraw()}
        </Button>
      </AlertAction>
    </Alert>
  )
}
