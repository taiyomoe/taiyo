import type { Insertable } from "kysely"

export interface UserFollow {
  followerId: string
  followingId: string
}

export type NewUserFollow = Insertable<UserFollow>
