import type { Generated, Insertable } from "kysely"
import type { ContentRating, Flag, Language } from "../constants"
import type { ChapterPage } from "../json-types"
import type { ArrayType, Timestamp } from "../types"

export interface Chapters {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
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

export type NewChapters = Insertable<Chapters>
