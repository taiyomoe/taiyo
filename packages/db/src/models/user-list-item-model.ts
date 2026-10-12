import type { Generated, Insertable } from "kysely"
import type { Timestamp } from "../types"

export type UserListItem = {
  listId: string
  mediaId: string
  position: number
  addedAt: Generated<Timestamp>
}

export type NewUserListItem = Insertable<UserListItem>
