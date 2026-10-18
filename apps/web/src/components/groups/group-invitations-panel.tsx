import * as stylex from "@stylexjs/stylex"
import { GROUP_PERMISSIONS, type GroupPermission, type Permissions } from "@taiyomoe/permissions"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { AuthAlert } from "@/components/auth/auth-alert"
import { TimeAgo } from "@/components/chapters/chapter-meta"
import { DashboardSection, ListCard, ListRow } from "@/components/dashboard/dashboard-page"
import { PersonAvatar } from "@/components/groups/group-avatar"
import { PermissionChecklist, PermissionChips } from "@/components/groups/group-permissions"
import { getErrorMessage } from "@/lib/errors"
import {
  groupInvitationsQueryOptions,
  useCancelInvitation,
  useInviteMember,
} from "@/lib/queries/groups"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  form: {
    padding: "1.5rem",
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1.25rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
  formTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
  },
  formDescription: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    marginTop: "0.25rem",
  },
  success: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  submit: {
    alignSelf: "flex-end",
  },
  main: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: 600,
  },
  meta: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
})
const ERRORS = {
  USER_NOT_FOUND: m.invite_error_user_not_found,
  GROUP_MEMBER_EXISTS: m.invite_error_member_exists,
  GROUP_INVITATION_EXISTS: m.invite_error_invitation_exists,
}

export function GroupInvitationsPanel({
  groupId,
  userId,
  can,
}: {
  groupId: string
  userId: string
  can: Permissions
}) {
  return (
    <>
      <InviteForm can={can} groupId={groupId} />
      <PendingInvitations can={can} groupId={groupId} userId={userId} />
    </>
  )
}

function InviteForm({ groupId, can }: { groupId: string; can: Permissions }) {
  const invite = useInviteMember(groupId)
  const [username, setUsername] = useState("")
  const [permissions, setPermissions] = useState<GroupPermission[]>([])
  const [sentTo, setSentTo] = useState<string | null>(null)

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()

        const trimmed = username.trim()

        if (trimmed === "") {
          return
        }

        invite.mutate(
          { username: trimmed, permissions },
          {
            onSuccess: () => {
              setSentTo(trimmed)
              setUsername("")
              setPermissions([])
            },
          },
        )
      }}
      sx={styles.form}
    >
      <div>
        <h2 sx={styles.formTitle}>{m.invite_title()}</h2>
        <p sx={styles.formDescription}>{m.invite_description()}</p>
      </div>
      <AuthAlert message={invite.isError ? getErrorMessage(invite.error, ERRORS) : null} />
      <Field>
        <FieldLabel>{m.invite_username()}</FieldLabel>
        <Input
          autoComplete="off"
          onChange={(event) => {
            setUsername(event.target.value)
            setSentTo(null)
          }}
          placeholder={m.invite_username_placeholder()}
          value={username}
        />
      </Field>
      <Field>
        <FieldLabel>{m.invite_permissions()}</FieldLabel>
        <PermissionChecklist
          canToggle={(permission) =>
            can("group.inviteMember", { groupId, permissions: [permission] })
          }
          onChange={setPermissions}
          value={permissions}
        />
        {GROUP_PERMISSIONS.every((permission) =>
          can("group.inviteMember", { groupId, permissions: [permission] }),
        ) ? null : (
          <FieldDescription>{m.group_permission_not_grantable()}</FieldDescription>
        )}
      </Field>
      {sentTo === null ? null : <p sx={styles.success}>{m.invite_sent({ username: sentTo })}</p>}
      <Button
        disabled={invite.isPending || username.trim() === ""}
        sx={styles.submit}
        type="submit"
      >
        {m.invite_submit()}
      </Button>
    </form>
  )
}

function PendingInvitations({
  groupId,
  userId,
  can,
}: {
  groupId: string
  userId: string
  can: Permissions
}) {
  const { data: invitations } = useSuspenseQuery(groupInvitationsQueryOptions(groupId))
  const cancel = useCancelInvitation(groupId)

  return (
    <DashboardSection title={m.invitations_pending()}>
      {invitations.length === 0 ? (
        <p sx={styles.empty}>{m.invitations_pending_empty()}</p>
      ) : (
        <ListCard>
          {invitations.map((invitation) => (
            <ListRow key={invitation.id}>
              <PersonAvatar person={invitation.invitee} />
              <div sx={styles.main}>
                <span sx={styles.name}>{invitation.invitee.displayUsername}</span>
                <div sx={styles.meta}>
                  <span>
                    {m.invitation_invited_by({ name: invitation.inviter.displayUsername })}
                  </span>
                  <span aria-hidden>·</span>
                  <TimeAgo date={invitation.createdAt} />
                </div>
                {invitation.permissions.length === 0 ? null : (
                  <PermissionChips permissions={invitation.permissions} />
                )}
              </div>
              {invitation.inviter.id === userId ||
              can("group.inviteMember", { groupId, permissions: invitation.permissions }) ? (
                <Button
                  disabled={cancel.isPending}
                  onClick={() => {
                    cancel.mutate(invitation.id)
                  }}
                  size="sm"
                  variant="ghost"
                >
                  {m.invitation_cancel()}
                </Button>
              ) : null}
            </ListRow>
          ))}
        </ListCard>
      )}
    </DashboardSection>
  )
}
