import type { Insertable } from "kysely"
import type { LocalizedText, StaffLinks } from "../json-types"
import type { Generated, Timestamp } from "../types"

export type Staff = {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  deletedAt: Timestamp | null
  name: string
  bio: Generated<LocalizedText>
  links: Generated<StaffLinks>
  image: string | null
  creatorId: string
  deleterId: string | null
}

export type NewStaff = Insertable<Staff>
