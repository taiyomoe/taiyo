import type { Generated, Insertable } from "kysely"
import type { LocalizedText, StaffLinks } from "../json-types"
import type { GeneratedTimestamp, Timestamp } from "../types"

export type Staff = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
  deletedAt: Timestamp | null
  name: string
  bio: Generated<LocalizedText>
  links: Generated<StaffLinks>
  image: string | null
  creatorId: string
  deleterId: string | null
}

export type NewStaff = Insertable<Staff>
