import type { Insertable } from "kysely"

export interface UserFollows {
  A: string
  B: string
}

export type NewUserFollows = Insertable<UserFollows>
