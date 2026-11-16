import type { ReactNode } from "react"
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { m } from "@/paraglide/messages"

export type ReviewNoteRequest = {
  title: ReactNode
  description: string
  label: string
  hint?: string | undefined
  placeholder: string
  /** Asks for a note before confirming. */
  required: boolean
  confirmLabel: string
  destructive: boolean
}

const NOTE_MAX = 2000
const styles = stylex.create({
  title: {
    overflowWrap: "anywhere",
  },
  form: {
    display: "contents",
  },
  fields: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})

/** Confirms a review decision, with the note it leaves for the requester or the team. */
export function ReviewNoteDialog({
  request,
  pending,
  error,
  onConfirm,
  onClose,
}: {
  request: ReviewNoteRequest | null
  pending: boolean
  error: string | null
  onConfirm: (note: string) => void
  onClose: () => void
}) {
  const [note, setNote] = useState("")
  const [touched, setTouched] = useState(false)
  const missing = request?.required === true && note.trim() === ""

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      onOpenChangeComplete={(open) => {
        if (!open) {
          setNote("")
          setTouched(false)
        }
      }}
      open={request !== null}
    >
      <DialogPopup>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            setTouched(true)

            if (!missing) {
              onConfirm(note.trim())
            }
          }}
          sx={styles.form}
        >
          <DialogHeader>
            <DialogTitle sx={styles.title}>{request?.title}</DialogTitle>
            <DialogDescription>{request?.description}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div sx={styles.fields}>
              <ErrorAlert message={error} />
              <Field invalid={touched && missing}>
                <FieldLabel>{request?.label}</FieldLabel>
                <Textarea
                  maxLength={NOTE_MAX}
                  onBlur={() => {
                    setTouched(true)
                  }}
                  onChange={(event) => {
                    setNote(event.target.value)
                  }}
                  placeholder={request?.placeholder}
                  rows={4}
                  value={note}
                />
                {request?.hint === undefined || (touched && missing) ? null : (
                  <FieldDescription>{request.hint}</FieldDescription>
                )}
                {touched && missing ? (
                  <FieldError match>{m.review_reject_note_required()}</FieldError>
                ) : null}
              </Field>
            </div>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {m.cancel()}
            </DialogClose>
            <Button
              loading={pending}
              type="submit"
              variant={request?.destructive === true ? "destructive" : "default"}
            >
              {request?.confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
