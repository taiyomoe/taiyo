import type { Generated, Insertable } from "kysely"
import type {
  ContentRating,
  Flag,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaSource,
  MediaStatus,
  MediaType,
} from "../constants"
import type { LocalizedText, MediaLinks, MediaTags } from "../json-types"
import type { ArrayType, Timestamp } from "../types"

export interface Medias {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  deletedAt: Timestamp | null
  startDate: Timestamp | null
  endDate: Timestamp | null
  synopsis: Generated<LocalizedText>
  contentRating: Generated<ContentRating>
  type: MediaType
  status: MediaStatus
  source: MediaSource
  demography: MediaDemography
  countryOfOrigin: MediaCountryOfOrigin
  tags: Generated<ArrayType<MediaTags> | null>
  flag: Generated<Flag>
  links: Generated<MediaLinks>
  creatorId: string
  deleterId: string | null
}

export type NewMedias = Insertable<Medias>
