import type { Insertable } from "kysely"

export interface ChapterToGroups {
  A: string
  B: string
}

export type NewChapterToGroups = Insertable<ChapterToGroups>
