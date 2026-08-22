import type { Generated, Insertable } from "kysely"
import type { Timestamp } from "../types"

export interface UserHistory {
  userId: string
  chapterId: string
  pageId: string | null
  completed: Generated<boolean>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewUserHistory = Insertable<UserHistory>
