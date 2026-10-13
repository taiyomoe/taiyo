import type { Generated, Insertable } from "kysely"
import type { Timestamp } from "../types"

export type FeaturedMedia = {
  mediaId: string
  position: number
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewFeaturedMedia = Insertable<FeaturedMedia>
