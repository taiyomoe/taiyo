import type { Insertable } from "kysely"
import type { Role } from "../constants"
import type { UserSettings } from "../json-types"
import type { Generated, Timestamp } from "../types"

export type User = {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  name: string
  email: string | null
  normalizedEmail: string | null
  emailVerified: boolean
  username: string
  displayUsername: string
  image: string | null
  role: Generated<Role>
  banned: boolean | null
  banReason: string | null
  banExpires: Timestamp | null
  settings: Generated<UserSettings>
}

export type NewUser = Insertable<User>
