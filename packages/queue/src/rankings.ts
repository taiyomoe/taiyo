import {
  ACHIEVEMENT_KEYS,
  ACHIEVEMENTS,
  type AchievementKey,
  type DB,
  getRankingPeriodEnd,
  getRankingPeriodStart,
  isBannedSql,
  RANKING_PERIOD_KINDS,
  type RankingPeriodKind,
  type ReaderTotalKind,
} from "@taiyomoe/db"
import { type Kysely, type QueryCreator, sql } from "kysely"

/** How many readers a closed period keeps, and how many the live rankings show. */
export const RANKING_SIZE = 10

/** The points a closed readers period pays, by rank: index 0 is #1. Days pay nothing. */
export const RANKING_REWARD_POINTS = {
  DAY: [],
  WEEK: [250, 150, 100, 50, 50, 50, 50, 50, 50, 50],
  MONTH: [1000, 600, 400, 200, 200, 200, 200, 200, 200, 200],
} as const satisfies Record<RankingPeriodKind, readonly number[]>

const DAY_MS = 86_400_000
// Days only matter until they are closed and their streaks counted: older daily totals go.
const DAILY_TOTALS_KEPT_DAYS = 7

/**
 * Every non-banned reader with at least one credited chapter in the period of `kind` starting at
 * `startsAt`, with their credited chapters and pages and when they reached that total, aliased
 * `totals`.
 */
export const selectReaderTotals = (
  db: QueryCreator<DB>,
  { kind, startsAt }: { kind: ReaderTotalKind; startsAt: Date },
) =>
  db
    .selectFrom("readerTotals as totals")
    .innerJoin("users", "users.id", "totals.userId")
    .where("totals.kind", "=", kind)
    .where("totals.startsAt", "=", startsAt)
    .where(sql<boolean>`not (${isBannedSql})`)

/**
 * The readers ranking order: most credited chapters, then most credited pages, then whoever
 * reached their total first, then user ID.
 */
export const READER_ORDER = sql`"totals"."chapters" desc, "totals"."pages" desc, "totals"."lastAt" asc, "totals"."userId" asc`

const RANK_ACHIEVEMENTS = ACHIEVEMENT_KEYS.flatMap((key) => {
  const { criteria } = ACHIEVEMENTS[key]

  return criteria.type === "rank" ? [{ key, periods: criteria.periods, rank: criteria.rank }] : []
})
const STREAK_ACHIEVEMENTS = ACHIEVEMENT_KEYS.flatMap((key) => {
  const { criteria } = ACHIEVEMENTS[key]

  return criteria.type === "streak" ? [{ key, days: criteria.days }] : []
})
const LONGEST_STREAK = Math.max(...STREAK_ACHIEVEMENTS.map(({ days }) => days))
// A daily win would notify every day: only the first one does.
const SILENT_REPEATS = new Set<AchievementKey>(["dailyChampion"])
const creditPoints = async (db: Kysely<DB>, userId: string, points: number) => {
  await db
    .insertInto("userProfiles")
    .values({ userId, points })
    .onConflict((oc) =>
      oc.column("userId").doUpdateSet({ points: sql<number>`"userProfiles"."points" + ${points}` }),
    )
    .execute()
}
/**
 * Stores an achievement, or counts it once more when repeatable, with its points and notification.
 * Resolves whether the user was notified, or null when they already held it.
 */
const earnAchievement = async (db: Kysely<DB>, userId: string, key: AchievementKey) => {
  const { repeatable, rewards } = ACHIEVEMENTS[key]
  const row = await db
    .insertInto("userAchievements")
    .values({ userId, key })
    .onConflict((oc) =>
      repeatable
        ? oc.columns(["userId", "key"]).doUpdateSet({
            count: sql<number>`"userAchievements"."count" + 1`,
            lastEarnedAt: sql<Date>`CURRENT_TIMESTAMP`,
          })
        : oc.columns(["userId", "key"]).doNothing(),
    )
    .returning("count")
    .executeTakeFirst()

  if (row === undefined) {
    return null
  }

  if (rewards.points !== undefined && rewards.points > 0) {
    await creditPoints(db, userId, rewards.points)
  }

  const notify = row.count === 1 || !SILENT_REPEATS.has(key)

  if (notify) {
    await db
      .insertInto("notifications")
      .values({ userId, type: "ACHIEVEMENT_EARNED", achievement: key })
      .execute()
  }

  return { notified: notify }
}
/** The number of consecutive closed days, ending with the one starting at `startsAt`, that `userId` finished #1. */
const getDailyStreak = async (db: Kysely<DB>, userId: string, startsAt: Date) => {
  const days = await db
    .selectFrom("rankingPeriods as p")
    .leftJoin("rankingResults as r", (join) =>
      join.onRef("r.periodId", "=", "p.id").on("r.rank", "=", 1),
    )
    .select(["p.startsAt", "r.userId"])
    .where("p.kind", "=", "DAY")
    .where("p.startsAt", "<=", startsAt)
    .orderBy("p.startsAt", "desc")
    .limit(LONGEST_STREAK)
    .execute()
  let streak = 0

  for (const day of days) {
    if (day.startsAt.getTime() !== startsAt.getTime() - streak * DAY_MS || day.userId !== userId) {
      break
    }

    streak += 1
  }

  return streak
}
const closePeriod = (
  db: Kysely<DB>,
  { kind, startsAt, endsAt }: { kind: RankingPeriodKind; startsAt: Date; endsAt: Date },
) =>
  db.transaction().execute(async (trx) => {
    // The unique (kind, startsAt) row is the lock: a concurrent or repeated run inserts nothing
    // and leaves, so a period pays once.
    const period = await trx
      .insertInto("rankingPeriods")
      .values({ kind, startsAt, endsAt })
      .onConflict((oc) => oc.columns(["kind", "startsAt"]).doNothing())
      .returning("id")
      .executeTakeFirst()

    if (period === undefined) {
      return null
    }

    const top = await selectReaderTotals(trx, { kind, startsAt })
      .select(["totals.userId", "totals.chapters", "totals.pages"])
      .orderBy(READER_ORDER)
      .limit(RANKING_SIZE)
      .execute()
    const payouts: readonly number[] = RANKING_REWARD_POINTS[kind]
    const results =
      top.length === 0
        ? []
        : await trx
            .insertInto("rankingResults")
            .values(
              top.map((row, index) => ({
                periodId: period.id,
                rank: index + 1,
                userId: row.userId,
                chapters: row.chapters,
                pages: row.pages,
                points: payouts[index] ?? 0,
              })),
            )
            .returning(["id", "rank", "userId", "points"])
            .execute()
    const notified = new Set<string>()
    let achievements = 0

    if (kind === "DAY") {
      await trx
        .deleteFrom("readerTotals")
        .where("kind", "=", "DAY")
        .where("startsAt", "<", new Date(startsAt.getTime() - DAILY_TOTALS_KEPT_DAYS * DAY_MS))
        .execute()
    }

    for (const result of results) {
      if (result.points > 0) {
        await creditPoints(trx, result.userId, result.points)
        await trx
          .insertInto("notifications")
          .values({ userId: result.userId, type: "RANKING_REWARD", rankingResultId: result.id })
          .execute()
        notified.add(result.userId)
      }

      const streak =
        result.rank === 1 && kind === "DAY" ? await getDailyStreak(trx, result.userId, startsAt) : 0
      const keys = [
        ...RANK_ACHIEVEMENTS.filter(
          (item) => item.periods.includes(kind) && result.rank <= item.rank,
        ),
        ...STREAK_ACHIEVEMENTS.filter((item) => streak >= item.days),
      ].map((item) => item.key)

      for (const key of keys) {
        const earned = await earnAchievement(trx, result.userId, key)

        if (earned !== null) {
          achievements += 1
        }

        if (earned?.notified === true) {
          notified.add(result.userId)
        }
      }
    }

    return {
      id: period.id,
      kind,
      startsAt,
      endsAt,
      results: results.length,
      points: results.reduce((sum, result) => sum + result.points, 0),
      achievements,
      userIds: [...notified],
    }
  })

/**
 * Closes every readers ranking period that ended by `now` and comes after the last closed one of
 * its kind, oldest first: stores its top readers, pays their points, awards the ranking
 * achievements and notifies the users. A kind with no closed period yet only gets a watermark, so
 * nothing before it is paid. Resolves the periods it closed.
 */
export const closeRankingPeriods = async (
  { db }: { db: Kysely<DB> },
  { now = new Date() }: { now?: Date } = {},
) => {
  const closed = []

  for (const kind of RANKING_PERIOD_KINDS) {
    const last = await db
      .selectFrom("rankingPeriods")
      .select("endsAt")
      .where("kind", "=", kind)
      .orderBy("startsAt", "desc")
      .limit(1)
      .executeTakeFirst()
    const current = getRankingPeriodStart(kind, now)

    if (last === undefined) {
      const previous = getRankingPeriodStart(kind, new Date(current.getTime() - 1))

      await db
        .insertInto("rankingPeriods")
        .values({ kind, startsAt: previous, endsAt: current })
        .onConflict((oc) => oc.columns(["kind", "startsAt"]).doNothing())
        .execute()

      continue
    }

    for (
      let startsAt = getRankingPeriodStart(kind, last.endsAt);
      startsAt < current;
      startsAt = getRankingPeriodEnd(kind, startsAt)
    ) {
      const period = await closePeriod(db, {
        kind,
        startsAt,
        endsAt: getRankingPeriodEnd(kind, startsAt),
      })

      if (period !== null) {
        closed.push(period)
      }
    }
  }

  return closed
}
