import type { Generated } from "../types"

export type MediaRatingStats = {
  mediaId: string
  ratingCount: Generated<number>
  ratingSum: Generated<number>
  /** The number of ratings of each score, 1 at index 0 through 10 at index 9. */
  scoreCounts: Generated<number[]>
}
