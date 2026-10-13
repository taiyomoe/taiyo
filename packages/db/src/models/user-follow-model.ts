import type { Insertable } from "kysely"

export type UserFollow = {
  followerId: string
  followingId: string
}

export type NewUserFollow = Insertable<UserFollow>
