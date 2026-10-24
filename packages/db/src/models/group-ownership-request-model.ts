import type { Insertable } from "kysely"
import type { GroupOwnershipRequestStatus } from "../constants"
import type { Generated, Timestamp } from "../types"

export type GroupOwnershipRequest = {
  id: Generated<string>
  userId: string
  groupId: string
  status: Generated<GroupOwnershipRequestStatus>
  message: string | null
  proofLinks: Generated<string[]>
  reviewerId: string | null
  reviewerNote: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewGroupOwnershipRequest = Insertable<GroupOwnershipRequest>
