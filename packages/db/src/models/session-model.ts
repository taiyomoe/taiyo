import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type Session = {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  userId: string
  token: string
  expiresAt: Timestamp
  impersonatedBy: string | null
  ipAddress: string | null
  userAgent: string | null
}

export type NewSession = Insertable<Session>
