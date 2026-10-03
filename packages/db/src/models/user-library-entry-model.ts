import type { Generated, Insertable } from "kysely"
import type { UserLibraryStatus } from "../constants"
import type { Timestamp } from "../types"

export interface UserLibraryEntry {
  userId: string
  mediaId: string
  status: UserLibraryStatus
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewUserLibraryEntry = Insertable<UserLibraryEntry>
