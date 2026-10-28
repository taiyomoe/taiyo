import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import type { MyGroupInvitation } from "@/features/groups/api/groups"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { TimeAgo } from "@/components/time/time-ago"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { InvitationGrants } from "@/features/groups/components/invitations/invitation-grants"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  card: {
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
  top: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
  },
  heading: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  name: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontSize: "1.125rem",
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  meta: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    justifyContent: "flex-end",
  },
})
const ERRORS = {
  GROUP_INVITATION_INVALID: m.invitation_error_invalid,
  GROUP_INVITATION_EXPIRED: m.invitation_error_expired,
}

export function InvitationCard({ invitation }: { invitation: MyGroupInvitation }) {
  const queryClient = useQueryClient()
  const answer = useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) =>
      ensureSuccess(
        accept
          ? await api["group-invitations"][":id"].accept.$post({ param: { id } })
          : await api["group-invitations"][":id"].decline.$post({ param: { id } }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["me"] }),
        queryClient.invalidateQueries({ queryKey: ["groups"] }),
      ]),
  })
  const navigate = useNavigate()

  return (
    <li sx={styles.card}>
      <div sx={styles.top}>
        <GroupAvatar id={invitation.group.id} name={invitation.group.name} />
        <div sx={styles.heading}>
          <Link
            params={{ groupId: invitation.group.id }}
            {...stylex.props(styles.name)}
            to="/groups/$groupId"
          >
            {invitation.group.name}
          </Link>
          <div sx={styles.meta}>
            <span>{m.invitation_invited_by({ name: invitation.inviter.displayUsername })}</span>
            <span aria-hidden>·</span>
            <span>
              <TimeAgo date={invitation.createdAt} />
            </span>
          </div>
        </div>
      </div>
      <InvitationGrants permissions={invitation.permissions} />
      <ErrorAlert message={answer.isError ? getErrorMessage(answer.error, ERRORS) : null} />
      <div sx={styles.actions}>
        <Button
          disabled={answer.isPending}
          onClick={() => {
            answer.mutate({ id: invitation.id, accept: false })
          }}
          variant="outline"
        >
          {m.invitation_decline()}
        </Button>
        <Button
          disabled={answer.isPending}
          onClick={() => {
            answer.mutate(
              { id: invitation.id, accept: true },
              {
                onSuccess: () => {
                  void navigate({
                    params: { groupId: invitation.group.id },
                    to: "/dashboard/groups/$groupId",
                  })
                },
              },
            )
          }}
        >
          {m.invitation_accept()}
        </Button>
      </div>
    </li>
  )
}
