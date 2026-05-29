import type { Generated, Insertable } from "kysely"
import type { LocalizedText, StaffLink } from "../json-types"
import type { Timestamp } from "../types"

export interface Staffs {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  deletedAt: Timestamp | null
  name: string
  bio: Generated<LocalizedText>
  links: Generated<StaffLink>
  image: string | null
  creatorId: string
  deleterId: string | null
}

export type NewStaffs = Insertable<Staffs>
