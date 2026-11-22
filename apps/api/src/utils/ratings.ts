import { config, getRatingAverage } from "@taiyomoe/config"
import { type DB, type Kysely, sql } from "@taiyomoe/db"
import z from "zod"

export type RatingDelta = { count: number; sum: number; scoreCounts: number[] }

/**
 * How replacing a user's score `previous` with `next` changes a title's totals; null is no rating.
 *
 * @internal Exported for its tests.
 */
export const getRatingDelta = (previous: number | null, next: number | null): RatingDelta => {
  const scoreCounts = Array.from({ length: config.ratings.maxScore }, () => 0)

  if (previous !== null) {
    scoreCounts[previous - 1] = -1
  }

  if (next !== null) {
    scoreCounts[next - 1] = (scoreCounts[next - 1] ?? 0) + 1
  }

  return {
    count: (next === null ? 0 : 1) - (previous === null ? 0 : 1),
    sum: (next ?? 0) - (previous ?? 0),
    scoreCounts,
  }
}

const applyRatingDelta = async (db: Kysely<DB>, mediaId: string, delta: RatingDelta) => {
  await db
    .insertInto("mediaRatingStats")
    .values({ mediaId })
    .onConflict((oc) => oc.column("mediaId").doNothing())
    .execute()
  await db
    .updateTable("mediaRatingStats")
    .set((eb) => ({
      ratingCount: eb("ratingCount", "+", delta.count),
      ratingSum: eb("ratingSum", "+", delta.sum),
      scoreCounts: sql<number[]>`array(
        select "a" + "b"
        from unnest("scoreCounts", ${delta.scoreCounts}::integer[]) with ordinality as "t"("a", "b", "i")
        order by "i"
      )`,
    }))
    .where("mediaId", "=", mediaId)
    .execute()
}

/** Saves the user's score for the media and returns the score it replaced, if any. */
export const setRating = async (
  db: Kysely<DB>,
  { userId, mediaId, score }: { userId: string; mediaId: string; score: number },
) => {
  for (;;) {
    const inserted = await db
      .insertInto("mediaRatings")
      .values({ userId, mediaId, score })
      .onConflict((oc) => oc.columns(["userId", "mediaId"]).doNothing())
      .returning("score")
      .executeTakeFirst()

    if (inserted !== undefined) {
      await applyRatingDelta(db, mediaId, getRatingDelta(null, score))

      return null
    }

    const existing = await db
      .selectFrom("mediaRatings")
      .select("score")
      .where("userId", "=", userId)
      .where("mediaId", "=", mediaId)
      .forUpdate()
      .executeTakeFirst()

    // Removed by a concurrent request between the insert and the lock: insert again.
    if (existing === undefined) {
      continue
    }

    if (existing.score !== score) {
      await db
        .updateTable("mediaRatings")
        .set({ score })
        .where("userId", "=", userId)
        .where("mediaId", "=", mediaId)
        .execute()
      await applyRatingDelta(db, mediaId, getRatingDelta(existing.score, score))
    }

    return existing.score
  }
}

/** Removes the user's score for the media and returns it, or null when there was none. */
export const removeRating = async (
  db: Kysely<DB>,
  { userId, mediaId }: { userId: string; mediaId: string },
) => {
  const removed = await db
    .deleteFrom("mediaRatings")
    .where("userId", "=", userId)
    .where("mediaId", "=", mediaId)
    .returning("score")
    .executeTakeFirst()

  if (removed === undefined) {
    return null
  }

  await applyRatingDelta(db, mediaId, getRatingDelta(removed.score, null))

  return removed.score
}

/**
 * Moves the ratings of a duplicate onto the media. A user who rated both keeps the score they
 * changed last.
 */
export const mergeRatings = async (
  db: Kysely<DB>,
  { mediaId, duplicateId }: { mediaId: string; duplicateId: string },
) => {
  await db
    .selectFrom("mediaRatingStats")
    .select("mediaId")
    .where("mediaId", "in", [mediaId, duplicateId])
    .forUpdate()
    .execute()
  await db
    .deleteFrom("mediaRatings as r")
    .where("r.mediaId", "in", [mediaId, duplicateId])
    .where((eb) =>
      eb.exists(
        eb
          .selectFrom("mediaRatings as o")
          .select("o.userId")
          .whereRef("o.userId", "=", "r.userId")
          .whereRef("o.mediaId", "!=", "r.mediaId")
          .where("o.mediaId", "in", [mediaId, duplicateId])
          .where((newer) =>
            newer.or([
              newer("o.updatedAt", ">", newer.ref("r.updatedAt")),
              newer.and([
                newer("o.updatedAt", "=", newer.ref("r.updatedAt")),
                newer("o.mediaId", "=", mediaId),
              ]),
            ]),
          ),
      ),
    )
    .execute()
  await db.updateTable("mediaRatings").set({ mediaId }).where("mediaId", "=", duplicateId).execute()
  await db.deleteFrom("mediaRatingStats").where("mediaId", "=", duplicateId).execute()

  const totals = db
    .selectFrom("mediaRatings")
    .where("mediaId", "=", mediaId)
    .select((eb) => [
      eb.val(mediaId).as("mediaId"),
      eb.fn.countAll<number>().as("ratingCount"),
      eb.fn.coalesce(eb.fn.sum<number>("score"), eb.lit(0)).as("ratingSum"),
      sql<number[]>`array(
        select count("r"."score")::integer
        from generate_series(1, ${config.ratings.maxScore}) as "g"("score")
        left join "mediaRatings" as "r" on "r"."mediaId" = ${mediaId} and "r"."score" = "g"."score"
        group by "g"."score"
        order by "g"."score"
      )`.as("scoreCounts"),
    ])

  await db
    .insertInto("mediaRatingStats")
    .columns(["mediaId", "ratingCount", "ratingSum", "scoreCounts"])
    .expression(totals)
    .onConflict((oc) =>
      oc.column("mediaId").doUpdateSet((eb) => ({
        ratingCount: eb.ref("excluded.ratingCount"),
        ratingSum: eb.ref("excluded.ratingSum"),
        scoreCounts: eb.ref("excluded.scoreCounts"),
      })),
    )
    .execute()
}

export const ratingSummarySchema = z.object({
  count: z
    .int()
    .nonnegative()
    .meta({ description: "The number of ratings of the media.", example: 214 }),
  average: z
    .number()
    .min(config.ratings.minScore)
    .max(config.ratings.maxScore)
    .nullable()
    .meta({ description: "The average score of the media, if it has ratings.", example: 8.4 }),
})

export const getRatingSummary = async (db: Kysely<DB>, mediaId: string) => {
  const stats = await db
    .selectFrom("mediaRatingStats")
    .select(["ratingCount", "ratingSum"])
    .where("mediaId", "=", mediaId)
    .executeTakeFirst()
  const totals = { count: stats?.ratingCount ?? 0, sum: stats?.ratingSum ?? 0 }

  return { count: totals.count, average: getRatingAverage(totals) }
}

export const ratingResultSchema = z.object({
  mediaId: z.uuid().meta({ description: "The ID of the media." }),
  score: z
    .int()
    .nullable()
    .meta({ description: "Your score for the media, if you rated it.", example: 8 }),
  rating: ratingSummarySchema.meta({ description: "The community rating of the media." }),
})
