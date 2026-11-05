import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type GroupComment = {
  id: Generated<string>
  groupId: string
  userId: string
  content: string
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  deletedAt: Timestamp | null
  deleterId: string | null
}

export type NewGroupComment = Insertable<GroupComment>
