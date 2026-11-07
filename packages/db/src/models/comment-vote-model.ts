import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type CommentVote = {
  commentId: string
  userId: string
  createdAt: Generated<Timestamp>
}

export type NewCommentVote = Insertable<CommentVote>
