import type { Insertable } from "kysely"
import type { ChapterStatus, ContentRating, Flag, Language } from "../constants"
import type { ChapterPage } from "../json-types"
import type { ArrayType, Generated, Timestamp } from "../types"

export type Chapter = {
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
  status: Generated<ChapterStatus>
  reviewerId: string | null
  reviewedAt: Timestamp | null
  rejectionReason: string | null
}

export type NewChapter = Insertable<Chapter>
