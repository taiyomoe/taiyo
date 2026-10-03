import type { Generated, Insertable } from "kysely"
import type { GroupMembershipRole } from "../constants"
import type { Timestamp } from "../types"

export interface GroupMembership {
  userId: string
  groupId: string
  role: GroupMembershipRole
  createdAt: Generated<Timestamp>
  addedBy: string
}

export type NewGroupMembership = Insertable<GroupMembership>
