import type { RecommendationSurface } from "../constants"
import type { Generated, Timestamp } from "../types"

export type RecommendationImpression = {
  id: Generated<string>
  surface: RecommendationSurface
  sourceMediaId: string | null
  mediaIds: string[]
  userId: string | null
  createdAt: Generated<Timestamp>
}
