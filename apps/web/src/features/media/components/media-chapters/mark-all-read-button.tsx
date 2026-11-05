import { CheckAll } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useState } from "react"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { useMarkMediaRead } from "@/features/chapters/api/read-markers"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function MarkAllReadButton({ mediaId }: { mediaId: string }) {
  const markAll = useMarkMediaRead(mediaId)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)

  return (
    <>
      <Button
        onClick={() => {
          setConfirmation({
            title: m.media_mark_all_read_title(),
            description: m.media_mark_all_read_description(),
            confirmLabel: m.media_mark_all_read(),
            run: () => markAll.mutateAsync(),
          })
        }}
        size="sm"
        variant="ghost"
      >
        <CheckAll />
        {m.media_mark_all_read()}
      </Button>
      <ConfirmDialog
        confirmation={confirmation}
        error={markAll.isError ? getErrorMessage(markAll.error) : null}
        onClose={() => {
          setConfirmation(null)
          markAll.reset()
        }}
        pending={markAll.isPending}
      />
    </>
  )
}
