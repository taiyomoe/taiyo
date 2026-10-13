import type { Generated, Insertable } from "kysely"
import type { GeneratedTimestamp, Timestamp } from "../types"

export type Group = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
  deletedAt: Timestamp | null
  name: string
  description: string | null
  logo: string | null
  banner: string | null
  website: string | null
  discord: string | null
  x: string | null
  facebook: string | null
  instagram: string | null
  telegram: string | null
  youtube: string | null
  email: string | null
  creatorId: string
  deleterId: string | null
}

export type NewGroup = Insertable<Group>
