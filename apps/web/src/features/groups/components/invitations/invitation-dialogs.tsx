import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MyGroupInvitation } from "@/features/groups/api/groups"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { TimeAgo } from "@/components/time/time-ago"
import { renderWithName } from "@/components/user-name/with-name"
import { DetailDialog } from "@/features/groups/components/detail-dialog"
import { InvitationGrants } from "@/features/groups/components/invitations/invitation-grants"
import { m } from "@/paraglide/messages"

export type InvitationDialog = {
  kind: "details" | "decline"
  invitations: MyGroupInvitation[]
  /** Opened from the selection, which clears once the action succeeds. */
  bulk: boolean
}

const styles = stylex.create({
  expiry: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

/** The invitation in full: who sent it, when it expires, and what it lets the user do. */
function InvitationDetailsDialog({
  invitation,
  answering,
  onAccept,
  onDecline,
  onClose,
}: {
  invitation: MyGroupInvitation | null
  answering: boolean
  onAccept: () => void
  onDecline: () => void
  onClose: () => void
}) {
  return (
    <DetailDialog
      footer={
        <>
          <Button disabled={answering} onClick={onDecline} variant="destructive-outline">
            {m.invitation_decline()}
          </Button>
          <Button loading={answering} onClick={onAccept}>
            {m.invitation_accept()}
          </Button>
        </>
      }
      meta={
        invitation === null ? null : (
          <>
            {renderWithName(m.invitation_invited_by, invitation.inviter)}
            <span aria-hidden>·</span>
            <TimeAgo date={invitation.createdAt} length="long" />
          </>
        )
      }
      onClose={onClose}
      open={invitation !== null}
      title={
        invitation === null ? null : m.invitation_details_title({ name: invitation.group.name })
      }
    >
      {invitation === null ? null : (
        <>
          <InvitationGrants permissions={invitation.permissions} />
          <p sx={styles.expiry}>
            {m.invitation_expires()} <TimeAgo date={invitation.expiresAt} future length="long" />
          </p>
        </>
      )}
    </DetailDialog>
  )
}

/** The dialogs the invitation table opens, one at a time, for one row or for the selection. */
export function InvitationDialogs({
  dialog,
  answering,
  declineError,
  onAccept,
  onDecline,
  onOpenDecline,
  onClose,
}: {
  dialog: InvitationDialog | null
  answering: boolean
  declineError: string | null
  onAccept: (invitation: MyGroupInvitation) => void
  onDecline: (invitations: MyGroupInvitation[]) => Promise<unknown>
  onOpenDecline: (invitation: MyGroupInvitation) => void
  onClose: () => void
}) {
  const [first] = dialog?.invitations ?? []
  const declining = dialog?.kind === "decline" ? dialog.invitations : null

  return (
    <>
      <InvitationDetailsDialog
        answering={answering}
        invitation={dialog?.kind === "details" ? (first ?? null) : null}
        onAccept={() => {
          if (first !== undefined) {
            onAccept(first)
          }
        }}
        onClose={onClose}
        onDecline={() => {
          if (first !== undefined) {
            onOpenDecline(first)
          }
        }}
      />
      <ConfirmDialog
        confirmation={
          declining === null || first === undefined
            ? null
            : {
                title:
                  declining.length === 1
                    ? m.invitation_decline_title({ name: first.group.name })
                    : m.invitation_bulk_decline_title({ count: declining.length }),
                description: m.invitation_decline_description(),
                confirmLabel: m.invitation_decline(),
                destructive: true,
                run: () => onDecline(declining),
              }
        }
        error={declineError}
        onClose={onClose}
        pending={answering}
      />
    </>
  )
}
