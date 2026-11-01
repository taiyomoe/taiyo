import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { DashboardSection, ListCard } from "@/components/layout/dashboard-page"
import { PendingInvitationRow } from "@/features/groups/components/manage-group/invitations/pending-invitation-row"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
})

export function PendingInvitations({
  groupId,
  userId,
  can,
}: {
  groupId: string
  userId: string
  can: Permissions
}) {
  const queryClient = useQueryClient()
  const { data: invitations } = useSuspenseQuery({
    queryKey: ["groups", groupId, "invitations"],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.groups[":id"].invitations.$get({ param: { id: groupId } }, { init: { signal } }),
      ),
  })
  const cancel = useMutation({
    mutationFn: async (invitationId: string) =>
      ensureSuccess(
        await api.groups[":id"].invitations[":invitationId"].$delete({
          param: { id: groupId, invitationId },
        }),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "invitations"] }),
  })

  return (
    <DashboardSection title={m.invitations_pending()}>
      {invitations.length === 0 ? (
        <p sx={styles.empty}>{m.invitations_pending_empty()}</p>
      ) : (
        <ListCard>
          {invitations.map((invitation) => (
            <PendingInvitationRow
              canCancel={
                invitation.inviter.id === userId ||
                can("group.inviteMember", { groupId, permissions: invitation.permissions })
              }
              cancelling={cancel.isPending}
              invitation={invitation}
              key={invitation.id}
              onCancel={() => {
                cancel.mutate(invitation.id)
              }}
            />
          ))}
        </ListCard>
      )}
    </DashboardSection>
  )
}
