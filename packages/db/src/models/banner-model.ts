import type { Generated, Insertable } from "kysely"
import type { ContentRating } from "../constants"
import type { GeneratedTimestamp, Timestamp } from "../types"

export type Banner = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
  deletedAt: Timestamp | null
  contentRating: Generated<ContentRating>
  extension: Generated<"gif" | "jpg">
  mediaId: string
  uploaderId: string
  deleterId: string | null
}

export type NewBanner = Insertable<Banner>
