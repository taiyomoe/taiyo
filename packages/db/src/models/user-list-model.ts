import type { Generated, Insertable } from "kysely"
import type { UserListVisibility } from "../constants"
import type { GeneratedTimestamp, Timestamp } from "../types"

export type UserList = {
  id: Generated<string>
  userId: string
  name: string
  description: string | null
  visibility: Generated<UserListVisibility>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
  deletedAt: Timestamp | null
}

export type NewUserList = Insertable<UserList>
