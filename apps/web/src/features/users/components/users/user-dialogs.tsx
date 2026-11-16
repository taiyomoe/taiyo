import { authClient } from "@taiyomoe/auth/client"
import { useMutation } from "@tanstack/react-query"
import type { ManagedUser } from "@/features/users/api/users"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { renderWithName } from "@/components/user-name/with-name"
import { unwrapAuth } from "@/features/users/api/user-admin"
import { BanDialog } from "@/features/users/components/users/ban-dialog"
import { SessionsDialog } from "@/features/users/components/users/sessions-dialog"
import { SetPasswordDialog } from "@/features/users/components/users/set-password-dialog"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type UserDialog = {
  kind: "ban" | "impersonate" | "sessions" | "password"
  user: ManagedUser
}

/** The dialogs a row of the user table opens, one at a time. */
export function UserDialogs({
  dialog,
  onClose,
}: {
  dialog: UserDialog | null
  onClose: () => void
}) {
  const impersonate = useMutation({
    mutationFn: (userId: string) => unwrapAuth(authClient.admin.impersonateUser({ userId })),
    onSuccess: () => {
      window.location.assign("/")
    },
  })

  return (
    <>
      <BanDialog onClose={onClose} user={dialog?.kind === "ban" ? dialog.user : null} />
      <ConfirmDialog
        confirmation={
          dialog?.kind === "impersonate"
            ? {
                title: renderWithName(m.impersonate_title, dialog.user),
                description: m.impersonate_description(),
                confirmLabel: m.impersonate_confirm({ name: dialog.user.displayUsername }),
                run: () => impersonate.mutateAsync(dialog.user.id),
              }
            : null
        }
        error={impersonate.isError ? getErrorMessage(impersonate.error) : null}
        onClose={() => {
          onClose()
          impersonate.reset()
        }}
        pending={impersonate.isPending}
      />
      {dialog?.kind === "sessions" ? <SessionsDialog onClose={onClose} user={dialog.user} /> : null}
      {dialog?.kind === "password" ? (
        <SetPasswordDialog onClose={onClose} user={dialog.user} />
      ) : null}
    </>
  )
}
