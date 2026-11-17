import type { Generated } from "../types"

export type RankingResult = {
  id: Generated<string>
  periodId: string
  rank: number
  userId: string
  chapters: number
  pages: number
  points: number
}
