import type { Generated, Insertable } from "kysely"
import type { Language } from "../constants"
import type { Timestamp } from "../types"

export interface Title {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  deletedAt: Timestamp | null
  title: string
  language: Language
  priority: number
  isAcronym: Generated<boolean>
  isMainTitle: Generated<boolean>
  mediaId: string
  creatorId: string
  deleterId: string | null
}

export type NewTitle = Insertable<Title>
