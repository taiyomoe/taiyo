import type { Generated, Insertable } from "kysely"
import type { GeneratedTimestamp } from "../types"

export type UserHistory = {
  userId: string
  chapterId: string
  pageId: string | null
  completed: Generated<boolean>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
}

export type NewUserHistory = Insertable<UserHistory>
