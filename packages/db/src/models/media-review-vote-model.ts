import type { Generated, Timestamp } from "../types"

export type MediaReviewVote = {
  userId: string
  reviewId: string
  createdAt: Generated<Timestamp>
}
