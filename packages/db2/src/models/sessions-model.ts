import type { Generated, Insertable } from "kysely"
import type { Timestamp } from "../types"

export interface Sessions {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  userId: string
  token: string
  expiresAt: Timestamp
  impersonatedBy: string | null
  ipAddress: string | null
  userAgent: string | null
}

export type NewSessions = Insertable<Sessions>
