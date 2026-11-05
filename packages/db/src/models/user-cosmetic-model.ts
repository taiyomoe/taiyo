import type { Insertable } from "kysely"
import type { CosmeticKind } from "../cosmetics"
import type { Generated, Timestamp } from "../types"

export type UserCosmetic = {
  userId: string
  kind: CosmeticKind
  key: string
  acquiredAt: Generated<Timestamp>
}

export type NewUserCosmetic = Insertable<UserCosmetic>
