import type { Generated, Insertable } from "kysely"
import type { GeneratedTimestamp, Timestamp } from "../types"

export type Account = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
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
