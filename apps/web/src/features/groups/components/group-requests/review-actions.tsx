import * as stylex from "@stylexjs/stylex"
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
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  actions: {
    gap: "0.5rem",
    display: "flex",
    justifyContent: "flex-end",
  },
})

export function ReviewActions({
  approveDisabled,
  error,
  pending,
  onApprove,
  onReject,
}: {
  approveDisabled: boolean
  error: string | null
  pending: boolean
  onApprove: () => Promise<unknown>
  onReject: (note: string) => Promise<unknown>
}) {
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState("")
  const [touched, setTouched] = useState(false)
  const missingNote = note.trim() === ""

  return (
    <>
      {rejecting ? null : <ErrorAlert message={error} />}
      <div sx={styles.actions}>
        <Button
          disabled={pending}
          onClick={() => {
            setRejecting(true)
          }}
          variant="outline"
        >
          {m.review_reject()}
        </Button>
        <Button
          disabled={pending || approveDisabled}
          onClick={() => {
            void onApprove().catch(() => {})
          }}
        >
          {m.review_approve()}
        </Button>
      </div>
      <Dialog onOpenChange={setRejecting} open={rejecting}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>{m.review_reject_title()}</DialogTitle>
            <DialogDescription>{m.review_reject_description()}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <ErrorAlert message={error} />
            <Field invalid={touched && missingNote}>
              <FieldLabel>{m.review_reject_note()}</FieldLabel>
              <Textarea
                onBlur={() => {
                  setTouched(true)
                }}
                onChange={(event) => {
                  setNote(event.target.value)
                }}
                placeholder={m.review_reject_note_placeholder()}
                rows={4}
                value={note}
              />
              {touched && missingNote ? (
                <FieldError match>{m.review_reject_note_required()}</FieldError>
              ) : null}
            </Field>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
            <Button
              disabled={pending}
              onClick={() => {
                setTouched(true)

                if (missingNote) {
                  return
                }

                void onReject(note.trim())
                  .then(() => {
                    setRejecting(false)
                  })
                  .catch(() => {})
              }}
              variant="destructive"
            >
              {m.review_reject()}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </>
  )
}
