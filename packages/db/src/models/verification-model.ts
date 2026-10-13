import type { Generated, Insertable } from "kysely"
import type { GeneratedTimestamp, Timestamp } from "../types"

export type Verification = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
  identifier: string
  value: string
  expiresAt: Timestamp
}

export type NewVerification = Insertable<Verification>
