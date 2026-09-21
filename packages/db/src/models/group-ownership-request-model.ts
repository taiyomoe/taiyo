import type { Generated, Insertable } from "kysely"
import type { GroupOwnershipRequestStatus } from "../constants"
import type { Timestamp } from "../types"

export interface GroupOwnershipRequest {
  id: Generated<string>
  userId: string
  groupId: string
  status: Generated<GroupOwnershipRequestStatus>
  message: string | null
  reviewerId: string | null
  reviewerNote: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewGroupOwnershipRequest = Insertable<GroupOwnershipRequest>
