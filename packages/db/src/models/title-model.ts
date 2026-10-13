import type { Generated, Insertable } from "kysely"
import type { Language } from "../constants"
import type { GeneratedTimestamp, Timestamp } from "../types"

export type Title = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
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
