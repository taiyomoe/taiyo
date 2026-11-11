import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type GroupFollow = {
  userId: string
  groupId: string
  createdAt: Generated<Timestamp>
}

export type NewGroupFollow = Insertable<GroupFollow>
