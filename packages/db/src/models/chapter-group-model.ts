import type { Insertable } from "kysely"

export interface ChapterGroup {
  chapterId: string
  groupId: string
}

export type NewChapterGroup = Insertable<ChapterGroup>
