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
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { PasswordInput } from "@taiyomoe/ui/components/ui/password-input"
import { useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  contents: {
    display: "contents",
  },
})

/** Asks for the password before a sensitive change, or just for confirmation when there is none. */
export function PasswordConfirmDialog({
  title,
  description,
  confirmLabel,
  destructive = false,
  hasPassword,
  pending,
  error,
  onConfirm,
  onClose,
  children,
}: {
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  hasPassword: boolean
  pending: boolean
  error: string | null
  onConfirm: (password: string | undefined) => void
  onClose: () => void
  children?: ReactNode
}) {
  const [password, setPassword] = useState("")

  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogPopup>
        <form
          sx={styles.contents}
          onSubmit={(event) => {
            event.preventDefault()
            onConfirm(hasPassword ? password : undefined)
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div sx={settingsStyles.form}>
              <ErrorAlert message={error} />
              {children}
              {hasPassword ? (
                <Field>
                  <FieldLabel>{m.global_password()}</FieldLabel>
                  <PasswordInput
                    autoComplete="current-password"
                    autoFocus
                    onChange={(event) => {
                      setPassword(event.target.value)
                    }}
                    required
                    value={password}
                  />
                </Field>
              ) : null}
            </div>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
            <Button
              disabled={hasPassword && password === ""}
              loading={pending}
              type="submit"
              variant={destructive ? "destructive" : "default"}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
