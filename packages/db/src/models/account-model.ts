import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type Account = {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
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

export type NewAccount = Insertable<Account>
