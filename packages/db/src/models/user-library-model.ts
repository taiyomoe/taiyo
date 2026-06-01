import type { Generated, Insertable } from "kysely"
import type { UserLibraryEntry } from "../json-types"
import type { ArrayType } from "../types"

export interface UserLibrary {
  userId: string
  reading: Generated<ArrayType<UserLibraryEntry> | null>
  rereading: Generated<ArrayType<UserLibraryEntry> | null>
  planToRead: Generated<ArrayType<UserLibraryEntry> | null>
  completed: Generated<ArrayType<UserLibraryEntry> | null>
  onHold: Generated<ArrayType<UserLibraryEntry> | null>
  dropped: Generated<ArrayType<UserLibraryEntry> | null>
}

export type NewUserLibrary = Insertable<UserLibrary>
