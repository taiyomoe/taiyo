import type { Generated, Timestamp } from "../types"

export type MediaRating = {
  userId: string
  mediaId: string
  score: number
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}
