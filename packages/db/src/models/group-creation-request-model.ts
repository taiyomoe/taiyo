import type { Insertable } from "kysely"
import type { GroupOwnershipRequestStatus } from "../constants"
import type { Generated, Timestamp } from "../types"

export type GroupCreationRequest = {
  id: Generated<string>
  userId: string
  name: string
  description: string | null
  proofLinks: Generated<string[]>
  message: string
  status: Generated<GroupOwnershipRequestStatus>
  reviewerId: string | null
  reviewerNote: string | null
  groupId: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewGroupCreationRequest = Insertable<GroupCreationRequest>
