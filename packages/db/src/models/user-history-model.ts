import type { Insertable } from "kysely"
import type { UserHistoryProgression } from "../json-types"
import type { ArrayType } from "../types"

export interface UserHistory {
  userId: string
  mediaId: string
  progression: ArrayType<UserHistoryProgression> | null
}

export type NewUserHistory = Insertable<UserHistory>
