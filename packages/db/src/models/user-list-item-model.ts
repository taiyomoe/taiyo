import type { Insertable } from "kysely"
import type { GeneratedTimestamp } from "../types"

export type UserListItem = {
  listId: string
  mediaId: string
  position: number
  addedAt: GeneratedTimestamp
}

export type NewUserListItem = Insertable<UserListItem>
