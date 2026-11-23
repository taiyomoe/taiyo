import type { Generated, Timestamp } from "../types"

export type MediaReview = {
  id: Generated<string>
  userId: string
  mediaId: string
  body: string
  containsSpoilers: Generated<boolean>
  helpfulCount: Generated<number>
  createdAt: Generated<Timestamp>
  /** When the author last changed the body or the spoiler flag; votes leave it alone. */
  updatedAt: Generated<Timestamp>
  deletedAt: Timestamp | null
  deleterId: string | null
}
