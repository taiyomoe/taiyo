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
import type { ArrayType, GeneratedTimestamp, Timestamp } from "../types"

export type Media = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
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

export type NewMedia = Insertable<Media>
