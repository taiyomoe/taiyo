import type { Generated, Timestamp } from "../types"

export type CommentImageFavorite = {
  userId: string
  imageId: string
  createdAt: Generated<Timestamp>
}
