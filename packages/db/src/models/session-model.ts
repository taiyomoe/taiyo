import type { Generated, Insertable } from "kysely"
import type { GeneratedTimestamp, Timestamp } from "../types"

export type Session = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
  userId: string
  token: string
  expiresAt: Timestamp
  impersonatedBy: string | null
  ipAddress: string | null
  userAgent: string | null
}

export type NewSession = Insertable<Session>
