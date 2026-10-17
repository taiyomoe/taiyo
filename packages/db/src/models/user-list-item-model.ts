import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type UserListItem = {
  listId: string
  mediaId: string
  position: number
  addedAt: Generated<Timestamp>
}

export type NewUserListItem = Insertable<UserListItem>
