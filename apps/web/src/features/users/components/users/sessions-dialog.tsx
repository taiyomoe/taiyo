import * as stylex from "@stylexjs/stylex"
import { authClient } from "@taiyomoe/auth/client"
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
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ManagedUser } from "@/features/users/api/users"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { sessionsKey, unwrapAuth, userSessionsQueryOptions } from "@/features/users/api/user-admin"
import { dialogStyles } from "@/features/users/components/users/dialog-styles"
import { SessionItem } from "@/features/users/components/users/session-item"
import { useNow } from "@/hooks/use-now"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  sessions: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
  },
})

type SessionsDialogProps = {
  user: ManagedUser
  onClose: () => void
}

export function SessionsDialog({ user, onClose }: SessionsDialogProps) {
  const sessions = useQuery(userSessionsQueryOptions(user.id))
  const queryClient = useQueryClient()
  const revoke = useMutation({
    mutationFn: (sessionToken: string | null) =>
      unwrapAuth(
        sessionToken === null
          ? authClient.admin.revokeUserSessions({ userId: user.id })
          : authClient.admin.revokeUserSession({ sessionToken }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionsKey(user.id) }),
  })
  const now = useNow()
  const active = (sessions.data ?? []).filter(
    (session) => new Date(session.expiresAt).getTime() > now,
  )

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
          <DialogTitle>{m.sessions_title({ name: user.displayUsername })}</DialogTitle>
          <DialogDescription>{m.sessions_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={dialogStyles.form}>
            <ErrorAlert
              message={
                sessions.isError || revoke.isError
                  ? getErrorMessage(sessions.error ?? revoke.error)
                  : null
              }
            />
            {sessions.data === undefined ? <p sx={styles.muted}>{m.sessions_loading()}</p> : null}
            {sessions.data !== undefined && active.length === 0 ? (
              <p sx={styles.muted}>{m.sessions_empty()}</p>
            ) : null}
            {active.length > 0 ? (
              <ul sx={styles.sessions}>
                {active.map((session) => (
                  <SessionItem
                    key={session.id}
                    onRevoke={() => {
                      revoke.mutate(session.token)
                    }}
                    revoking={revoke.isPending}
                    session={session}
                  />
                ))}
              </ul>
            ) : null}
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button
            disabled={revoke.isPending || active.length === 0}
            onClick={() => {
              revoke.mutate(null)
            }}
            variant="destructive"
          >
            {m.sessions_revoke_all()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
