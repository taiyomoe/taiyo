import * as stylex from "@stylexjs/stylex"
import { Mail } from "@taiyomoe/ui/components/icons"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { useSuspenseQuery } from "@tanstack/react-query"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { myGroupInvitationsQueryOptions } from "@/features/groups/api/groups"
import { InvitationCard } from "@/features/groups/components/invitations/invitation-card"
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
})

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
