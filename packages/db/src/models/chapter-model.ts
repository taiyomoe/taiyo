import type { Generated, Insertable } from "kysely"
import type { ContentRating, Flag, Language } from "../constants"
import type { ChapterPage } from "../json-types"
import type { ArrayType, GeneratedTimestamp, Timestamp } from "../types"

export type Chapter = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
  deletedAt: Timestamp | null
  title: string | null
  number: number
  volume: string | null
  language: Language
  pages: ArrayType<ChapterPage> | null
  contentRating: Generated<ContentRating>
  flag: Generated<Flag>
  mediaId: string
  uploaderId: string
  deleterId: string | null
}

export type NewChapter = Insertable<Chapter>
