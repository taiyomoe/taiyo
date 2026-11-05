import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type UserProfileComment = {
  id: Generated<string>
  profileId: string
  authorId: string
  content: string
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  deletedAt: Timestamp | null
}

export type NewUserProfileComment = Insertable<UserProfileComment>
