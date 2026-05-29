import type { Generated, Insertable } from "kysely"
import type { ContentRating } from "../constants"
import type { Timestamp } from "../types"

export interface Banners {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  deletedAt: Timestamp | null
  contentRating: Generated<ContentRating>
  mediaId: string
  uploaderId: string
  deleterId: string | null
}

export type NewBanners = Insertable<Banners>
