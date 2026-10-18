import type { Insertable } from "kysely"
import type { GroupInvitationStatus, GroupPermission } from "../constants"
import type { Generated, Timestamp } from "../types"

export type GroupInvitation = {
  id: Generated<string>
  groupId: string
  inviteeId: string
  inviterId: string
  permissions: Generated<GroupPermission[]>
  status: Generated<GroupInvitationStatus>
  expiresAt: Timestamp
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewGroupInvitation = Insertable<GroupInvitation>
