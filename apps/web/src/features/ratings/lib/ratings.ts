import { config } from "@taiyomoe/config"
import type { MediaStats } from "@/features/ratings/api/ratings"
import { getLocale } from "@/paraglide/runtime"

export const SCORES = Array.from(
  { length: config.ratings.maxScore - config.ratings.minScore + 1 },
  (_, index) => config.ratings.minScore + index,
)

export const hasEnoughRatings = (count: number) => count >= config.ratings.minCountForAverage

export const formatAverage = (average: number) =>
  average.toLocaleString(getLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** The stats once a viewer's score goes from `previous` to `next`; null is no score. */
export const applyScoreChange = (
  stats: MediaStats,
  previous: number | null,
  next: number | null,
): MediaStats => {
  if (previous === next) {
    return stats
  }

  const distribution = stats.rating.distribution.map((row) => ({
    score: row.score,
    count: row.count - (row.score === previous ? 1 : 0) + (row.score === next ? 1 : 0),
  }))
  const count = distribution.reduce((total, row) => total + row.count, 0)
  const sum = distribution.reduce((total, row) => total + row.score * row.count, 0)

  return { ...stats, rating: { count, average: count === 0 ? null : sum / count, distribution } }
}
