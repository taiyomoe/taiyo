import type { ColumnType, Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type CommentImage = {
  id: Generated<string>
  uploaderId: string
  key: string
  width: number
  height: number
  animated: boolean
  byteSize: number
  sha256: string
  dhash: ColumnType<string, string, string>
  createdAt: Generated<Timestamp>
  removedAt: Timestamp | null
  removerId: string | null
}

export type NewCommentImage = Insertable<CommentImage>
