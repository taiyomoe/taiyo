import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type CommentRevision = {
  id: Generated<string>
  commentId: string
  content: string
  createdAt: Timestamp
}

export type NewCommentRevision = Insertable<CommentRevision>
