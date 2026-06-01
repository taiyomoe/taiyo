import type { Insertable } from "kysely"
import type { StaffRole } from "../constants"

export interface StaffOnMedia {
  mediaId: string
  staffId: string
  role: StaffRole
}

export type NewStaffOnMedia = Insertable<StaffOnMedia>
