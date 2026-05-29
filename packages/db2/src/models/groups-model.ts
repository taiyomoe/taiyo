import type { Generated, Insertable } from "kysely"
import type { Timestamp } from "../types"

export interface Groups {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
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

export type NewGroups = Insertable<Groups>
