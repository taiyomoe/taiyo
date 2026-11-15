import type { Generated, Timestamp } from "../types"

export type CommentVote = {
  commentId: string
  userId: string
  createdAt: Generated<Timestamp>
}
