import type { Generated, Insertable } from "kysely"
import type { Country, Gender } from "../constants"
import type { LocalizedText } from "../json-types"
import type { Timestamp } from "../types"

export interface UserProfile {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  banner: string | null
  birthDate: Timestamp | null
  gender: Generated<Gender>
  city: string | null
  country: Country | null
  about: Generated<LocalizedText>
  points: Generated<number>
  userId: string
}

export type NewUserProfile = Insertable<UserProfile>
