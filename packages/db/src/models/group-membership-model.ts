import type { Insertable } from "kysely"
import type { GroupMembershipRole, GroupPermission } from "../constants"
import type { Generated, Timestamp } from "../types"

export type GroupMembership = {
  userId: string
  groupId: string
  role: GroupMembershipRole
  permissions: Generated<GroupPermission[]>
  createdAt: Generated<Timestamp>
  addedBy: string
}

export type NewGroupMembership = Insertable<GroupMembership>
