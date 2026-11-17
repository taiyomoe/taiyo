export const RANKING_PERIOD_KINDS = ["DAY", "WEEK", "MONTH"] as const

export type RankingPeriodKind = (typeof RANKING_PERIOD_KINDS)[number]

/** The periods `readerTotals` keeps a reader's credited chapters for: all time adds to the closed kinds. */
export type ReaderTotalKind = RankingPeriodKind | "ALL"

/** Where the all-time period of `readerTotals` starts. */
export const ALL_TIME_START = new Date(0)

const DAY_MS = 86_400_000

/** When the UTC calendar period of `kind` containing `date` starts: midnight, Monday or the 1st. */
export const getRankingPeriodStart = (kind: RankingPeriodKind, date: Date) => {
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

  if (kind === "DAY") {
    return new Date(day)
  }

  if (kind === "WEEK") {
    return new Date(day - ((date.getUTCDay() + 6) % 7) * DAY_MS)
  }

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

/** When the period of `kind` starting at `start` ends, which is when the next one starts. */
export const getRankingPeriodEnd = (kind: RankingPeriodKind, start: Date) => {
  if (kind === "DAY") {
    return new Date(start.getTime() + DAY_MS)
  }

  if (kind === "WEEK") {
    return new Date(start.getTime() + 7 * DAY_MS)
  }

  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1))
}
