import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type ReadingReward = {
  id: Generated<string>
  userId: string
  chapterId: string
  mediaId: string
  number: number
  pages: number
  points: number
  createdAt: Generated<Timestamp>
}

export type NewReadingReward = Insertable<ReadingReward>
