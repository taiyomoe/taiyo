import type { ColumnType } from "kysely"
import type { MediaSimilarityItem } from "../json-types"
import type { Generated, Timestamp } from "../types"

export type MediaSimilarity = {
  mediaId: string
  items: ColumnType<MediaSimilarityItem[], string, string>
  computedAt: Generated<Timestamp>
}
