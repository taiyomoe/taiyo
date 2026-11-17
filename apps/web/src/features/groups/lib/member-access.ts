import type { MemberTarget, Permissions } from "@taiyomoe/permissions"
import type { GroupMember } from "@/features/groups/api/groups"

/** What the viewer may do to one member of the group they manage. */
export const getMemberAccess = (
  member: GroupMember,
  {
    can,
    groupId,
    userId,
    owners,
  }: { can: Permissions; groupId: string; userId: string; owners: number },
) => {
  const target: MemberTarget = {
    groupId,
    userId: member.userId,
    role: member.role,
    permissions: member.permissions ?? [],
  }
  const self = member.userId === userId
  const lastOwner = member.role === "OWNER" && owners <= 1

  return {
    target,
    self,
    edit:
      member.permissions !== null &&
      can("group.updateMember", { member: target, permissions: target.permissions }),
    remove: !self && can("group.removeMember", target),
    promote: can("group.promoteMember", target),
    stepDown: self && !lastOwner && can("group.demoteMember", target),
    leave: self && !lastOwner,
  }
}

export type MemberAccess = ReturnType<typeof getMemberAccess>
