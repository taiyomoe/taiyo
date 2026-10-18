import type { Insertable } from "kysely"
import type { MediaEditField, MediaSuggestionStatus } from "../constants"
import type { MediaEdit } from "../json-types"
import type { Generated, Timestamp } from "../types"

export type MediaSuggestion = {
  id: Generated<string>
  mediaId: string
  authorId: string
  status: Generated<MediaSuggestionStatus>
  changes: MediaEdit
  base: MediaEdit
  note: string | null
  acceptedFields: Generated<MediaEditField[]>
  reviewerId: string | null
  reviewerNote: string | null
  reviewedAt: Timestamp | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewMediaSuggestion = Insertable<MediaSuggestion>
