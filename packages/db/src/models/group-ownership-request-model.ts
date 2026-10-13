import type { Generated, Insertable } from "kysely"
import type { GroupOwnershipRequestStatus } from "../constants"
import type { GeneratedTimestamp } from "../types"

export type GroupOwnershipRequest = {
  id: Generated<string>
  userId: string
  groupId: string
  status: Generated<GroupOwnershipRequestStatus>
  message: string | null
  reviewerId: string | null
  reviewerNote: string | null
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
}

export type NewGroupOwnershipRequest = Insertable<GroupOwnershipRequest>
