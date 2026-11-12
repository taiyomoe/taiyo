import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type UserListVote = {
  listId: string
  userId: string
  createdAt: Generated<Timestamp>
}

export type NewUserListVote = Insertable<UserListVote>
