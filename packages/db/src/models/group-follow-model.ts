import type { Generated, Timestamp } from "../types"

export type GroupFollow = {
  userId: string
  groupId: string
  createdAt: Generated<Timestamp>
}
