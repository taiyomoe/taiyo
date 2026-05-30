import type { Generated, Insertable } from "kysely"
import type { Timestamp } from "../types"

export interface Verifications {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  identifier: string
  value: string
  expiresAt: Timestamp
}

export type NewVerifications = Insertable<Verifications>
