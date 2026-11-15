import * as stylex from "@stylexjs/stylex"
import { GROUP_PERMISSIONS, type GroupPermission, type Permissions } from "@taiyomoe/permissions"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { PermissionChecklist } from "@/features/groups/components/permission-checklist"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
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
})
const ERRORS = {
  USER_NOT_FOUND: m.invite_error_user_not_found,
  GROUP_MEMBER_EXISTS: m.invite_error_member_exists,
  GROUP_INVITATION_EXISTS: m.invite_error_invitation_exists,
}

export function InviteMemberForm({ groupId, can }: { groupId: string; can: Permissions }) {
  const queryClient = useQueryClient()
  const invite = useMutation({
    mutationFn: async (json: { username: string; permissions: GroupPermission[] }) =>
      ensureSuccess(await api.groups[":id"].invitations.$post({ param: { id: groupId }, json })),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "invitations"] }),
  })
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
      <ErrorAlert message={invite.isError ? getErrorMessage(invite.error, ERRORS) : null} />
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
