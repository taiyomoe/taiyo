import type { Generated, Insertable } from "kysely"
import type { ContentRating, Language } from "../constants"
import type { Timestamp } from "../types"

export interface Covers {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  deletedAt: Timestamp | null
  volume: string | null
  contentRating: Generated<ContentRating>
  isMainCover: Generated<boolean>
  language: Language
  mediaId: string
  uploaderId: string
  deleterId: string | null
}

export type NewCovers = Insertable<Covers>
