import type { Insertable } from "kysely"
import type { UserHistoryProgression } from "../json-types"
import type { ArrayType } from "../types"

export interface UserHistories {
  userId: string
  mediaId: string
  progression: ArrayType<UserHistoryProgression> | null
}

export type NewUserHistories = Insertable<UserHistories>
