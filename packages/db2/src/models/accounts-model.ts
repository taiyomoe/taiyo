import type { Generated, Insertable } from "kysely"
import type { Timestamp } from "../types"

export interface Accounts {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  providerId: string
  accountId: string
  userId: string
  password: string | null
  accessToken: string | null
  refreshToken: string | null
  accessTokenExpiresAt: Timestamp | null
  refreshTokenExpiresAt: Timestamp | null
  scope: string | null
  idToken: string | null
}

export type NewAccounts = Insertable<Accounts>
