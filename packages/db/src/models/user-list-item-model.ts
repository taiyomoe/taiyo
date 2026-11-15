import type { Generated, Timestamp } from "../types"

export type UserListItem = {
  listId: string
  mediaId: string
  position: number
  addedAt: Generated<Timestamp>
}
