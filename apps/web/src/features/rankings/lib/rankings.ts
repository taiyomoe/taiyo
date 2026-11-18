export const RANKING_CATEGORIES = ["readers", "groups", "titles"] as const

export type RankingCategory = (typeof RANKING_CATEGORIES)[number]

export const RANKING_PERIODS = ["week", "month", "all"] as const

export type RankingPeriod = (typeof RANKING_PERIODS)[number]
