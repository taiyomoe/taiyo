import * as stylex from "@stylexjs/stylex"
import { Mail } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { AuthAlert } from "@/components/auth/auth-alert"
import { TimeAgo } from "@/components/chapters/chapter-meta"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { GroupAvatar } from "@/components/groups/group-avatar"
import { GROUP_PERMISSION_LABELS } from "@/components/groups/group-permissions"
import { getErrorMessage } from "@/lib/errors"
import {
  type MyGroupInvitation,
  myGroupInvitationsQueryOptions,
  useAnswerInvitation,
} from "@/lib/queries/groups"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "1rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
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
  grants: {
    padding: "1rem",
    borderRadius: `calc(${radius.xxl} - 0.75rem)`,
    gap: "0.625rem",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 3%, transparent)`,
    display: "flex",
    flexDirection: "column",
  },
  grantsTitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  grantList: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  grant: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
  },
  grantLabel: {
    fontSize: "0.9375rem",
    fontWeight: 500,
  },
  grantDescription: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
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

export function InvitationsPage() {
  const { data: invitations } = useSuspenseQuery(myGroupInvitationsQueryOptions)

  return (
    <DashboardPage subtitle={m.my_invitations_subtitle()} title={m.my_invitations_title()}>
      {invitations.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Mail />
            </EmptyMedia>
            <EmptyTitle>{m.my_invitations_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.my_invitations_empty_description()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul sx={styles.list}>
          {invitations.map((invitation) => (
            <InvitationCard invitation={invitation} key={invitation.id} />
          ))}
        </ul>
      )}
    </DashboardPage>
  )
}

function InvitationCard({ invitation }: { invitation: MyGroupInvitation }) {
  const answer = useAnswerInvitation()
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
      <div sx={styles.grants}>
        {invitation.permissions.length === 0 ? (
          <p sx={styles.grantsTitle}>{m.invitation_grants_nothing()}</p>
        ) : (
          <>
            <p sx={styles.grantsTitle}>{m.invitation_grants()}</p>
            <ul sx={styles.grantList}>
              {invitation.permissions.map((permission) => (
                <li key={permission} sx={styles.grant}>
                  <span sx={styles.grantLabel}>{GROUP_PERMISSION_LABELS[permission].label()}</span>
                  <span sx={styles.grantDescription}>
                    {GROUP_PERMISSION_LABELS[permission].description()}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <AuthAlert message={answer.isError ? getErrorMessage(answer.error, ERRORS) : null} />
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
