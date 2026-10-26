import type { InferResponseType } from "hono/client"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { api } from "@/lib/api"
import { ListRow } from "@/components/layout/dashboard-page"
import { TimeAgo } from "@/components/time/time-ago"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { PermissionChips } from "@/features/groups/components/permission-chips"
import { m } from "@/paraglide/messages"

type GroupInvitation = InferResponseType<
  (typeof api.groups)[":id"]["invitations"]["$get"],
  200
>["data"][number]

const styles = stylex.create({
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
})

type PendingInvitationRowProps = {
  invitation: GroupInvitation
  canCancel: boolean
  cancelling: boolean
  onCancel: () => void
}

export function PendingInvitationRow({
  invitation,
  canCancel,
  cancelling,
  onCancel,
}: PendingInvitationRowProps) {
  return (
    <ListRow>
      <PersonAvatar person={invitation.invitee} />
      <div sx={styles.main}>
        <span sx={styles.name}>{invitation.invitee.displayUsername}</span>
        <div sx={styles.meta}>
          <span>{m.invitation_invited_by({ name: invitation.inviter.displayUsername })}</span>
          <span aria-hidden>·</span>
          <TimeAgo date={invitation.createdAt} />
        </div>
        {invitation.permissions.length === 0 ? null : (
          <PermissionChips permissions={invitation.permissions} />
        )}
      </div>
      {canCancel ? (
        <Button disabled={cancelling} onClick={onCancel} size="sm" variant="ghost">
          {m.invitation_cancel()}
        </Button>
      ) : null}
    </ListRow>
  )
}
