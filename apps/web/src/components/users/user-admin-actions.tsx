import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Ellipsis, Eye, Key, Monitor } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
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
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@taiyomoe/ui/components/ui/menu"
import { PasswordInput } from "@taiyomoe/ui/components/ui/password-input"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { ManagedUser } from "@/lib/queries/users"
import { AuthAlert } from "@/components/auth/auth-alert"
import { TimeAgo } from "@/components/chapters/chapter-meta"
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog"
import { getErrorMessage } from "@/lib/errors"
import {
  type UserSession,
  useImpersonateUser,
  useRevokeSessions,
  userSessionsQueryOptions,
  useSetUserPassword,
} from "@/lib/queries/user-admin"
import { useNow } from "@/lib/use-now"
import { describeUserAgent } from "@/lib/user-agent"
import { m } from "@/paraglide/messages"

type Dialogs = "impersonate" | "sessions" | "password" | null

const styles = stylex.create({
  sessions: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  session: {
    padding: "0.75rem",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  sessionIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  sessionMain: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  sessionTitle: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    fontWeight: 600,
  },
  sessionMeta: {
    gap: "0.75rem",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
  },
  form: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  check: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
  },
})
const iso = (value: string | Date) => new Date(value).toISOString()
const deviceOf = (session: UserSession) => {
  const device = describeUserAgent(session.userAgent)

  return device === null ? m.sessions_unknown_device() : m.sessions_device(device)
}

function SessionRow({
  session,
  pending,
  onRevoke,
}: {
  session: UserSession
  pending: boolean
  onRevoke: () => void
}) {
  return (
    <li sx={styles.session}>
      <Monitor size={20} {...stylex.props(styles.sessionIcon)} />
      <div sx={styles.sessionMain}>
        <span sx={styles.sessionTitle}>
          {deviceOf(session)}
          {typeof session.impersonatedBy === "string" ? (
            <Badge variant="warning">{m.sessions_impersonation()}</Badge>
          ) : null}
        </span>
        <span sx={styles.sessionMeta}>
          {session.ipAddress === null || session.ipAddress === undefined ? null : (
            <span>{session.ipAddress}</span>
          )}
          <span>
            {m.sessions_signed_in()} <TimeAgo date={iso(session.createdAt)} />
          </span>
          <span>
            {m.sessions_expires()} <TimeAgo date={iso(session.expiresAt)} future />
          </span>
        </span>
      </div>
      <Button disabled={pending} onClick={onRevoke} size="sm" variant="outline">
        {m.sessions_revoke()}
      </Button>
    </li>
  )
}

function SessionsDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const sessions = useQuery(userSessionsQueryOptions(user.id))
  const revoke = useRevokeSessions(user.id)
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
          <div sx={styles.form}>
            <AuthAlert
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
                  <SessionRow
                    key={session.id}
                    onRevoke={() => {
                      revoke.mutate(session.token)
                    }}
                    pending={revoke.isPending}
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

function SetPasswordDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const setPassword = useSetUserPassword()
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
          <div sx={styles.form}>
            <AuthAlert message={setPassword.isError ? getErrorMessage(setPassword.error) : null} />
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

export function UserAdminActions({ user, can }: { user: ManagedUser; can: Permissions }) {
  const impersonate = useImpersonateUser()
  const [open, setOpen] = useState<Dialogs>(null)
  const target = { id: user.id, role: user.role }
  const canImpersonate = can("user.impersonate", target) && !user.banned
  const canManageSessions = can("user.manageSessions", target)
  const canSetPassword = can("user.setPassword", target)
  const close = () => {
    setOpen(null)
  }

  if (!canImpersonate && !canManageSessions && !canSetPassword) {
    return null
  }

  return (
    <>
      <Menu>
        <MenuTrigger
          render={
            <Button
              aria-label={m.user_admin_more({ name: user.displayUsername })}
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <Ellipsis />
        </MenuTrigger>
        <MenuPopup align="end">
          {canImpersonate ? (
            <MenuItem
              onClick={() => {
                setOpen("impersonate")
              }}
            >
              <Eye />
              {m.user_admin_impersonate()}
            </MenuItem>
          ) : null}
          {canManageSessions ? (
            <MenuItem
              onClick={() => {
                setOpen("sessions")
              }}
            >
              <Monitor />
              {m.user_admin_sessions()}
            </MenuItem>
          ) : null}
          {canSetPassword ? (
            <MenuItem
              onClick={() => {
                setOpen("password")
              }}
            >
              <Key />
              {m.user_admin_set_password()}
            </MenuItem>
          ) : null}
        </MenuPopup>
      </Menu>
      <ConfirmDialog
        confirmation={
          open === "impersonate"
            ? {
                title: m.impersonate_title({ name: user.displayUsername }),
                description: m.impersonate_description(),
                confirmLabel: m.impersonate_confirm({ name: user.displayUsername }),
                run: () => impersonate.mutateAsync(user.id),
              }
            : null
        }
        error={impersonate.isError ? getErrorMessage(impersonate.error) : null}
        onClose={() => {
          close()
          impersonate.reset()
        }}
        pending={impersonate.isPending}
      />
      {open === "sessions" ? <SessionsDialog onClose={close} user={user} /> : null}
      {open === "password" ? <SetPasswordDialog onClose={close} user={user} /> : null}
    </>
  )
}
