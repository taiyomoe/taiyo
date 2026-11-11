import type { Insertable } from "kysely"
import type { UserLibraryStatus } from "../constants"
import type { Generated, Timestamp } from "../types"

export type UserLibraryEntry = {
  userId: string
  mediaId: string
  status: UserLibraryStatus
  notify: Generated<boolean>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewUserLibraryEntry = Insertable<UserLibraryEntry>
