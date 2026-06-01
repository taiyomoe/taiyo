import type { Insertable } from "kysely"

export interface ChapterToGroup {
  A: string
  B: string
}

export type NewChapterToGroup = Insertable<ChapterToGroup>
