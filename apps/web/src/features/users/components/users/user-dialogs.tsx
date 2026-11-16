import { authClient } from "@taiyomoe/auth/client"
import { useMutation } from "@tanstack/react-query"
import type { ManagedUser } from "@/features/users/api/users"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { renderWithName } from "@/components/user-name/with-name"
import { unwrapAuth } from "@/features/users/api/user-admin"
import { CosmeticDialog } from "@/features/users/components/users/actions/cosmetic-dialog"
import { PointsDialog } from "@/features/users/components/users/actions/points-dialog"
import { RoleDialog } from "@/features/users/components/users/actions/role-dialog"
import { BanDialog } from "@/features/users/components/users/ban-dialog"
import { SessionsDialog } from "@/features/users/components/users/sessions-dialog"
import { SetPasswordDialog } from "@/features/users/components/users/set-password-dialog"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type UserDialog = {
  kind: "ban" | "impersonate" | "sessions" | "password" | "role" | "points" | "cosmetic"
  users: ManagedUser[]
  /** Opened from the selection, which clears once the action succeeds. */
  bulk: boolean
}

/** The dialogs the user table opens, one at a time, for one row or for the selection. */
export function UserDialogs({
  dialog,
  selfId,
  onClose,
  onBulkDone,
}: {
  dialog: UserDialog | null
  selfId: string
  onClose: () => void
  onBulkDone: () => void
}) {
  const impersonate = useMutation({
    mutationFn: (userId: string) => unwrapAuth(authClient.admin.impersonateUser({ userId })),
    onSuccess: () => {
      window.location.assign("/")
    },
  })
  const [user] = dialog?.users ?? []
  const pick = (kind: UserDialog["kind"]) => (dialog?.kind === kind ? dialog.users : null)
  const onDone = dialog?.bulk === true ? onBulkDone : undefined

  return (
    <>
      <RoleDialog onClose={onClose} onDone={onDone} selfId={selfId} users={pick("role")} />
      <PointsDialog onClose={onClose} onDone={onDone} users={pick("points")} />
      <CosmeticDialog onClose={onClose} onDone={onDone} users={pick("cosmetic")} />
      <BanDialog onClose={onClose} user={dialog?.kind === "ban" ? (user ?? null) : null} />
      <ConfirmDialog
        confirmation={
          dialog?.kind === "impersonate" && user !== undefined
            ? {
                title: renderWithName(m.impersonate_title, user),
                description: m.impersonate_description(),
                confirmLabel: m.impersonate_confirm({ name: user.displayUsername }),
                run: () => impersonate.mutateAsync(user.id),
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
      {dialog?.kind === "sessions" && user !== undefined ? (
        <SessionsDialog onClose={onClose} user={user} />
      ) : null}
      {dialog?.kind === "password" && user !== undefined ? (
        <SetPasswordDialog onClose={onClose} user={user} />
      ) : null}
    </>
  )
}
