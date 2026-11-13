import type { Insertable } from "kysely"
import type { MediaRelationType } from "../constants"
import type { Generated, Timestamp } from "../types"

export type MediaRelation = {
  mediaId: string
  relatedMediaId: string
  type: MediaRelationType
  createdAt: Generated<Timestamp>
}

export type NewMediaRelation = Insertable<MediaRelation>
