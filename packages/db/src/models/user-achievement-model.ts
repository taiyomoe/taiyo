import type { Generated, Timestamp } from "../types"

export type UserAchievement = {
  userId: string
  key: string
  count: Generated<number>
  firstEarnedAt: Generated<Timestamp>
  lastEarnedAt: Generated<Timestamp>
}
