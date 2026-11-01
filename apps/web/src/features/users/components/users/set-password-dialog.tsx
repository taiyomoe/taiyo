import * as stylex from "@stylexjs/stylex"
import { authClient } from "@taiyomoe/auth/client"
import { config } from "@taiyomoe/config"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
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
import { PasswordInput } from "@taiyomoe/ui/components/ui/password-input"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import type { ManagedUser } from "@/features/users/api/users"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { sessionsKey, unwrapAuth } from "@/features/users/api/user-admin"
import { dialogStyles } from "@/features/users/components/users/dialog-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  check: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
  },
})

export function SetPasswordDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const queryClient = useQueryClient()
  const setPassword = useMutation({
    mutationFn: async ({
      userId,
      newPassword,
      signOut: revokeSessions,
    }: {
      userId: string
      newPassword: string
      signOut: boolean
    }) => {
      await unwrapAuth(authClient.admin.setUserPassword({ userId, newPassword }))

      if (revokeSessions) {
        await unwrapAuth(authClient.admin.revokeUserSessions({ userId }))
      }
    },
    onSuccess: (_data, { userId }) =>
      queryClient.invalidateQueries({ queryKey: sessionsKey(userId) }),
  })
  const [password, setPasswordValue] = useState("")
  const [signOut, setSignOut] = useState(true)
  const [touched, setTouched] = useState(false)
  const { minLength, maxLength } = config.auth.password
  const tooShort = password.length < minLength
  const invalid = touched && tooShort

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
        <DialogHeader>
          <DialogTitle>{m.set_password_title({ name: user.displayUsername })}</DialogTitle>
          <DialogDescription>{m.set_password_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={dialogStyles.form}>
            <ErrorAlert message={setPassword.isError ? getErrorMessage(setPassword.error) : null} />
            <Field invalid={invalid}>
              <FieldLabel>{m.set_password_label()}</FieldLabel>
              <PasswordInput
                autoComplete="new-password"
                maxLength={maxLength}
                onBlur={() => {
                  setTouched(true)
                }}
                onChange={(event) => {
                  setPasswordValue(event.target.value)
                }}
                value={password}
              />
              {invalid ? (
                <FieldError match>{m.user_admin_password_short({ min: minLength })}</FieldError>
              ) : null}
            </Field>
            <label sx={styles.check}>
              <Checkbox
                checked={signOut}
                onCheckedChange={(checked) => {
                  setSignOut(checked)
                }}
              />
              {m.set_password_sign_out()}
            </label>
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button
            disabled={setPassword.isPending}
            onClick={() => {
              setTouched(true)

              if (!tooShort) {
                setPassword.mutate(
                  { userId: user.id, newPassword: password, signOut },
                  { onSuccess: onClose },
                )
              }
            }}
          >
            {m.set_password_submit()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
