import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
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
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useState } from "react"
import type { ManagedStaff } from "@/features/staffs/api/staffs"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { useRenameStaff } from "@/features/staffs/api/staffs"
import { dialogStyles } from "@/features/users/components/users/dialog-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  contents: {
    display: "contents",
  },
})

export function RenameStaffDialog({
  staff,
  onClose,
}: {
  staff: ManagedStaff
  onClose: () => void
}) {
  const rename = useRenameStaff()
  const [name, setName] = useState(staff.name)
  const trimmed = name.trim()
  const submit = () => {
    if (trimmed === "" || trimmed === staff.name) {
      onClose()

      return
    }

    rename.mutate(
      { id: staff.id, name: trimmed },
      {
        onSuccess: () => {
          toastManager.add({ title: m.staffs_renamed(), type: "success" })
          onClose()
        },
      },
    )
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open
    >
      <DialogPopup>
        <form
          sx={styles.contents}
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{m.staffs_rename_title({ name: staff.name })}</DialogTitle>
            <DialogDescription>{m.staffs_rename_description()}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div sx={dialogStyles.form}>
              <ErrorAlert message={rename.isError ? getErrorMessage(rename.error) : null} />
              <Field>
                <FieldLabel>{m.staffs_rename_label()}</FieldLabel>
                <Input
                  autoFocus
                  maxLength={config.input.maxNameLength}
                  onChange={(event) => {
                    setName(event.target.value)
                  }}
                  value={name}
                />
              </Field>
            </div>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
            <Button disabled={trimmed === ""} loading={rename.isPending} type="submit">
              {m.staffs_rename_submit()}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
