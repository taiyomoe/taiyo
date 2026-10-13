import type { Generated, Insertable } from "kysely"
import type { Country, Gender } from "../constants"
import type { LocalizedText } from "../json-types"
import type { GeneratedTimestamp, Timestamp } from "../types"

export type UserProfile = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
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
