import { cacheClient } from "@taiyomoe/cache"
import { ALL_TIME_START, getRankingPeriodEnd, getRankingPeriodStart } from "@taiyomoe/db"
import { RANKING_SIZE } from "@taiyomoe/queue"
import z from "zod"
import { userSummarySchema } from "./schemas"

export const RANKING_CACHE_TTL_SECONDS = 300

/**
 * The board cached under `key`, or loaded and cached. An empty board is never cached: it costs
 * next to nothing to load, and once a period starts it would hide its first entries for minutes,
 * saying nobody is ranked next to the live standing of a reader who already is.
 */
export const getCachedBoard = async <Board extends { entries: unknown[] }>(
  key: string,
  load: () => Promise<Board>,
) => {
  const cached = await cacheClient.rankings.get<Board>(key)

  if (cached !== null) {
    return cached
  }

  const board = await load()

  if (board.entries.length > 0) {
    await cacheClient.rankings.set(key, board, RANKING_CACHE_TTL_SECONDS)
  }

  return board
}

const KINDS = { week: "WEEK", month: "MONTH" } as const
const PERIODS = ["week", "month", "all"] as const

export const rankingQuerySchema = z.object({
  period: z.enum(PERIODS).default("week").meta({
    description:
      "The period to rank: `week` since Monday 00:00 UTC, `month` since the 1st 00:00 UTC, or `all` time. Defaults to `week`.",
    example: "week",
  }),
})

export type RankingPeriod = z.infer<typeof rankingQuerySchema>["period"]

/**
 * The bounds of the current calendar period, null for all time, and the `readerTotals` period
 * that holds it.
 */
export const getRankingWindow = (period: RankingPeriod, now = new Date()) => {
  if (period === "all") {
    return {
      from: null,
      startsAt: null,
      endsAt: null,
      totals: { kind: "ALL", startsAt: ALL_TIME_START } as const,
    }
  }

  const from = getRankingPeriodStart(KINDS[period], now)

  return {
    from,
    startsAt: from.toISOString(),
    endsAt: getRankingPeriodEnd(KINDS[period], from).toISOString(),
    totals: { kind: KINDS[period], startsAt: from },
  }
}

export const rankSchema = z.int().positive().meta({ description: "The rank, from 1.", example: 1 })

export const rankedUserSchema = userSummarySchema.extend({
  title: z
    .string()
    .nullable()
    .meta({ description: "The profile title the user has equipped, if any.", example: "bookworm" }),
  level: z.int().positive().meta({
    description: "The lifetime reader level of the user, from every page read and credited.",
    example: 27,
  }),
})

export const rankingBoardSchema = <T extends z.ZodType>(entry: T, participants: string) =>
  z.object({
    period: z.enum(PERIODS).meta({ description: "The period ranked.", example: "week" }),
    startsAt: z.iso
      .datetime()
      .nullable()
      .meta({ description: "When the period started, in UTC, or null for all time." }),
    endsAt: z.iso
      .datetime()
      .nullable()
      .meta({ description: "When the period ends, in UTC, or null for all time." }),
    total: z
      .int()
      .nonnegative()
      .meta({ description: `The number of ${participants}.`, example: 342 }),
    entries: entry.array().meta({ description: `The top ${RANKING_SIZE}, best first.` }),
  })
