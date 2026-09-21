import type { Insertable } from "kysely"
import type { StaffRole } from "../constants"

export interface MediaStaff {
  mediaId: string
  staffId: string
  role: StaffRole
}

export type NewMediaStaff = Insertable<MediaStaff>
