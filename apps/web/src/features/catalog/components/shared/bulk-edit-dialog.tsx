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
import { ErrorAlert } from "@/components/feedback/error-alert"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  // The popup lays out its header, panel and footer as direct children; the
  // form must not add a box between them.
  form: {
    display: "contents",
  },
  fields: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
})

/** The shell of a bulk edit: every field starts on "keep as is". */
export function BulkEditDialog({
  open,
  title,
  description = m.catalog_bulk_edit_description(),
  changed,
  submitLabel = m.catalog_bulk_apply(),
  submitVariant = "default",
  pending,
  error,
  onSubmit,
  onClose,
  children,
}: {
  open: boolean
  title: string
  description?: string
  changed: boolean
  submitLabel?: string
  submitVariant?: "default" | "destructive"
  pending: boolean
  error: string | null
  onSubmit: () => void
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
      open={open}
    >
      <DialogPopup>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()

            if (changed) {
              onSubmit()
            }
          }}
          sx={styles.form}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div sx={styles.fields}>
              <ErrorAlert message={error} />
              {children}
            </div>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {m.cancel()}
            </DialogClose>
            <Button
              disabled={!changed}
              loading={pending}
              title={changed ? undefined : m.catalog_bulk_nothing()}
              type="submit"
              variant={submitVariant}
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
