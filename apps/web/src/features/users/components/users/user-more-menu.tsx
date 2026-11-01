import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { authClient } from "@taiyomoe/auth/client"
import { Ellipsis, Eye, Key, Monitor } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@taiyomoe/ui/components/ui/menu"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import type { ManagedUser } from "@/features/users/api/users"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { unwrapAuth } from "@/features/users/api/user-admin"
import { SessionsDialog } from "@/features/users/components/users/sessions-dialog"
import { SetPasswordDialog } from "@/features/users/components/users/set-password-dialog"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

type Dialogs = "impersonate" | "sessions" | "password" | null

const styles = stylex.create({
  moreSlot: {
    display: "flex",
    justifyContent: "flex-end",
    width: "2rem",
  },
})

export function UserMoreMenu({ user, can }: { user: ManagedUser; can: Permissions }) {
  const impersonate = useMutation({
    mutationFn: (userId: string) => unwrapAuth(authClient.admin.impersonateUser({ userId })),
    onSuccess: () => {
      window.location.assign("/")
    },
  })
  const [open, setOpen] = useState<Dialogs>(null)
  const target = { id: user.id, role: user.role }
  const canImpersonate = can("user.impersonate", target) && !user.banned
  const canManageSessions = can("user.manageSessions", target)
  const canSetPassword = can("user.setPassword", target)
  const close = () => {
    setOpen(null)
  }

  return (
    <div sx={styles.moreSlot}>
      {canImpersonate || canManageSessions || canSetPassword ? (
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
      ) : null}
    </div>
  )
}
