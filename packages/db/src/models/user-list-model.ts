import type { Generated, Insertable } from "kysely"
import type { UserListVisibility } from "../constants"
import type { Timestamp } from "../types"

export interface UserList {
  id: Generated<string>
  userId: string
  name: string
  description: string | null
  visibility: Generated<UserListVisibility>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  deletedAt: Timestamp | null
}

export type NewUserList = Insertable<UserList>
