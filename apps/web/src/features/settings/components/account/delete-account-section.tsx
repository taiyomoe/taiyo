import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Mail, Trash } from "@taiyomoe/ui/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import type { Session } from "@/lib/session"
import {
  myAccountsQueryOptions,
  myDeletionBlockersQueryOptions,
  useRequestAccountDeletion,
} from "@/features/settings/api/account"
import { PasswordConfirmDialog } from "@/features/settings/components/security/password-confirm-dialog"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  lists: {
    gap: "0.75rem",
    display: "grid",
  },
  heading: {
    margin: 0,
    fontSize: "0.875rem",
    fontWeight: font.weightBold,
  },
  list: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: 1.5,
    paddingInlineStart: "1.125rem",
  },
  link: {
    textDecoration: "underline",
    color: colors.foreground,
  },
  blockers: {
    margin: 0,
    paddingInlineStart: "1.125rem",
  },
})

function DeletionBlockers() {
  const blockers = useQuery(myDeletionBlockersQueryOptions)

  if (blockers.data === undefined) {
    return blockers.isError ? null : <Skeleton sx={settingsStyles.itemSkeleton} />
  }

  const { ownedGroups, lastAdmin } = blockers.data

  if (ownedGroups.length === 0 && !lastAdmin) {
    return null
  }

  return (
    <Alert variant="warning">
      <AlertTitle>{m.user_settings_delete_blocked_title()}</AlertTitle>
      <AlertDescription>
        <ul sx={styles.blockers}>
          {ownedGroups.map((group) => (
            <li key={group.id}>
              {m.user_settings_delete_blocked_group({ name: group.name })}{" "}
              <Link
                params={{ groupId: group.id }}
                search={{ tab: "members" }}
                to="/dashboard/groups/$groupId"
                {...stylex.props(styles.link)}
              >
                {m.user_settings_delete_blocked_group_fix()}
              </Link>
            </li>
          ))}
          {lastAdmin ? (
            <li>
              {m.user_settings_delete_blocked_admin()}{" "}
              <Link to="/dashboard/users" {...stylex.props(styles.link)}>
                {m.user_settings_delete_blocked_admin_fix()}
              </Link>
            </li>
          ) : null}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

function DeleteAccountDialog({
  user,
  hasPassword,
  onSent,
  onClose,
}: {
  user: Session["user"]
  hasPassword: boolean
  onSent: () => void
  onClose: () => void
}) {
  const request = useRequestAccountDeletion()
  const blockers = useQuery(myDeletionBlockersQueryOptions)
  const [typed, setTyped] = useState("")
  const username = user.username ?? ""
  const blocked =
    blockers.data === undefined || blockers.data.ownedGroups.length > 0 || blockers.data.lastAdmin

  return (
    <PasswordConfirmDialog
      confirmDisabled={blocked || typed.trim().toLowerCase() !== username.toLowerCase()}
      confirmLabel={m.user_settings_delete_confirm()}
      description={m.user_settings_delete_dialog_description()}
      destructive
      error={request.isError ? getErrorMessage(request.error) : null}
      hasPassword={hasPassword}
      onClose={onClose}
      onConfirm={(password) => {
        request.mutate(password, { onSuccess: onSent })
      }}
      pending={request.isPending}
      title={m.user_settings_delete_dialog_title()}
    >
      <DeletionBlockers />
      <div sx={styles.lists}>
        <div>
          <p sx={styles.heading}>{m.user_settings_delete_gone_title()}</p>
          <ul sx={styles.list}>
            <li>{m.user_settings_delete_gone_account()}</li>
            <li>{m.user_settings_delete_gone_reading()}</li>
            <li>{m.user_settings_delete_gone_social()}</li>
            <li>{m.user_settings_delete_gone_comments()}</li>
          </ul>
        </div>
        <div>
          <p sx={styles.heading}>{m.user_settings_delete_kept_title()}</p>
          <ul sx={styles.list}>
            <li>{m.user_settings_delete_kept_contributions()}</li>
          </ul>
        </div>
      </div>
      <p sx={settingsStyles.muted}>
        {m.user_settings_delete_export_hint()}{" "}
        <Link search={{ tab: "privacy" }} to="/settings" {...stylex.props(styles.link)}>
          {m.user_settings_delete_export_link()}
        </Link>
      </p>
      <Field>
        <FieldLabel>{m.user_settings_delete_type_username({ username })}</FieldLabel>
        <Input
          autoCapitalize="none"
          autoComplete="off"
          onChange={(event) => {
            setTyped(event.target.value)
          }}
          spellCheck={false}
          value={typed}
        />
      </Field>
    </PasswordConfirmDialog>
  )
}

export function DeleteAccountSection({ user }: { user: Session["user"] }) {
  const accounts = useQuery(myAccountsQueryOptions)
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const hasPassword =
    accounts.data === undefined
      ? null
      : accounts.data.some((account) => account.providerId === "credential")

  return (
    <>
      <SettingsSection
        description={m.user_settings_delete_description()}
        footer={
          <div sx={settingsStyles.actions}>
            <Button
              disabled={hasPassword === null}
              onClick={() => {
                setOpen(true)
              }}
              variant="destructive-outline"
            >
              <Trash />
              {sent ? m.user_settings_delete_resend() : m.user_settings_delete_button()}
            </Button>
          </div>
        }
        title={m.user_settings_delete_title()}
      >
        {sent ? (
          <Alert aria-live="polite" variant="info">
            <Mail />
            <AlertTitle>{m.user_settings_delete_sent_title()}</AlertTitle>
            <AlertDescription>
              {m.user_settings_delete_sent({
                email: user.email,
                minutes: config.auth.deleteAccountLinkTtlSeconds / 60,
              })}
            </AlertDescription>
          </Alert>
        ) : undefined}
      </SettingsSection>
      {open && hasPassword !== null ? (
        <DeleteAccountDialog
          hasPassword={hasPassword}
          onClose={() => {
            setOpen(false)
          }}
          onSent={() => {
            setOpen(false)
            setSent(true)
          }}
          user={user}
        />
      ) : null}
    </>
  )
}
