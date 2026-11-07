import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type BlockedCommentImage = {
  id: Generated<string>
  sha256: string
  dhash: string
  width: number
  height: number
  imageId: string | null
  blockerId: string | null
  createdAt: Generated<Timestamp>
}

export type NewBlockedCommentImage = Insertable<BlockedCommentImage>
