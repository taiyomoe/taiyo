import type { RecommendationSurface } from "../constants"
import type { Generated, Timestamp } from "../types"

export type RecommendationClick = {
  id: Generated<string>
  surface: RecommendationSurface
  sourceMediaId: string | null
  mediaId: string
  position: number
  userId: string | null
  createdAt: Generated<Timestamp>
}
