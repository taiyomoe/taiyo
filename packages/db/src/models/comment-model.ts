import type { Insertable } from "kysely"
import type { CommentDeletion } from "../constants"
import type { Generated, Timestamp } from "../types"

export type Comment = {
  id: Generated<string>
  threadId: string
  parentId: string | null
  replyToId: string | null
  authorId: string | null
  content: string
  upvoteCount: Generated<number>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  editedAt: Timestamp | null
  deletedAt: Timestamp | null
  deletion: CommentDeletion | null
  deleterId: string | null
}

export type NewComment = Insertable<Comment>
