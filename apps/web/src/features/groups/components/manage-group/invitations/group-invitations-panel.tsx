import type { Permissions } from "@taiyomoe/permissions"
import { InviteMemberForm } from "@/features/groups/components/manage-group/invitations/invite-member-form"
import { PendingInvitations } from "@/features/groups/components/manage-group/invitations/pending-invitations"

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
      <InviteMemberForm can={can} groupId={groupId} />
      <PendingInvitations can={can} groupId={groupId} userId={userId} />
    </>
  )
}
