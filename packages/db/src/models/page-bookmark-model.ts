import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type PageBookmark = {
  id: Generated<string>
  userId: string
  chapterId: string
  pageId: string
  createdAt: Generated<Timestamp>
}

export type NewPageBookmark = Insertable<PageBookmark>
