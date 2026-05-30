import type { Insertable } from "kysely"
import type { StaffRole } from "../constants"

export interface StaffOnMedias {
  mediaId: string
  staffId: string
  role: StaffRole
}

export type NewStaffOnMedias = Insertable<StaffOnMedias>
