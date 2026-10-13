import type { Insertable } from "kysely"
import type { UserLibraryStatus } from "../constants"
import type { GeneratedTimestamp } from "../types"

export type UserLibraryEntry = {
  userId: string
  mediaId: string
  status: UserLibraryStatus
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
}

export type NewUserLibraryEntry = Insertable<UserLibraryEntry>
