import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type CommentThread = {
  id: Generated<string>
  mediaId: string | null
  chapterId: string | null
  groupId: string | null
  profileId: string | null
  createdAt: Generated<Timestamp>
}

export type NewCommentThread = Insertable<CommentThread>
