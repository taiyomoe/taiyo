import type { Insertable } from "kysely"

export type ChapterGroup = {
  chapterId: string
  groupId: string
}

export type NewChapterGroup = Insertable<ChapterGroup>
