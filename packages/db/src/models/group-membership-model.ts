import type { Insertable } from "kysely"
import type { GroupMembershipRole } from "../constants"
import type { GeneratedTimestamp } from "../types"

export type GroupMembership = {
  userId: string
  groupId: string
  role: GroupMembershipRole
  createdAt: GeneratedTimestamp
  addedBy: string
}

export type NewGroupMembership = Insertable<GroupMembership>
