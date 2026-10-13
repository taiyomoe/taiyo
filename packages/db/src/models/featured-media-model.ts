import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type FeaturedMedia = {
  mediaId: string
  position: number
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewFeaturedMedia = Insertable<FeaturedMedia>
