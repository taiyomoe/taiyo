import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type UserHistory = {
  userId: string
  chapterId: string
  pageId: string | null
  completed: Generated<boolean>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewUserHistory = Insertable<UserHistory>
