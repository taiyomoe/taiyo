import type { Insertable } from "kysely"
import type { GeneratedTimestamp } from "../types"

export type FeaturedMedia = {
  mediaId: string
  position: number
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
}

export type NewFeaturedMedia = Insertable<FeaturedMedia>
