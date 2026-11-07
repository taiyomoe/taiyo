import type { Insertable } from "kysely"

export type CommentImageUsage = {
  commentId: string
  imageId: string
}

export type NewCommentImageUsage = Insertable<CommentImageUsage>
