import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type TwoFactor = {
  id: Generated<string>
  userId: string
  secret: string
  backupCodes: string
  verified: Generated<boolean>
  failedVerificationCount: Generated<number>
  lockedUntil: Timestamp | null
}

export type NewTwoFactor = Insertable<TwoFactor>
