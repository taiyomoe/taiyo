import type { Insertable } from "kysely"

export interface UserFollow {
  A: string
  B: string
}

export type NewUserFollow = Insertable<UserFollow>
