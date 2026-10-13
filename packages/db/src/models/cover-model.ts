import type { Generated, Insertable } from "kysely"
import type { ContentRating, Language } from "../constants"
import type { GeneratedTimestamp, Timestamp } from "../types"

export type Cover = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
  deletedAt: Timestamp | null
  volume: string | null
  contentRating: Generated<ContentRating>
  isMainCover: Generated<boolean>
  extension: Generated<"gif" | "jpg">
  language: Language
  mediaId: string
  uploaderId: string
  deleterId: string | null
}

export type NewCover = Insertable<Cover>
