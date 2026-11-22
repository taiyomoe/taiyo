import { type Kysely, sql } from "kysely"
import type { DB } from "../database"

/**
 * Rates a stable subset of the sample library entries, skewed toward the 7 to 9 most sites see,
 * so the media page shows titles with no, few and enough ratings. Skipped once any rating exists.
 */
export async function seed(db: Kysely<DB>): Promise<void> {
  const existing = await db.selectFrom("mediaRatings").select("mediaId").limit(1).executeTakeFirst()

  if (existing !== undefined) {
    return
  }

  const hash = sql<number>`abs(hashtext("userId"::text || "mediaId"::text))`
  const skewed = sql<number>`(array[2, 4, 5, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10])[1 + ${hash} % 14]`

  await db
    .insertInto("mediaRatings")
    .columns(["userId", "mediaId", "score"])
    .expression(
      db
        .selectFrom("userLibraryEntries")
        .select((eb) => [
          "userId",
          "mediaId",
          eb
            .case()
            .when("status", "=", "DROPPED")
            .then(sql<number>`greatest(1, ${skewed} - 4)`)
            .else(skewed)
            .end()
            .as("score"),
        ])
        .where("status", "!=", "PLAN_TO_READ")
        .where(sql<boolean>`${hash} % 5 <> 0`),
    )
    .execute()

  await db
    .insertInto("mediaRatingStats")
    .columns(["mediaId", "ratingCount", "ratingSum", "scoreCounts"])
    .expression(
      db
        .selectFrom("mediaRatings as r")
        .select((eb) => [
          "r.mediaId",
          eb.fn.countAll<number>().as("ratingCount"),
          eb.fn.sum<number>("r.score").as("ratingSum"),
          sql<number[]>`array(
            select count(*) filter (where "s"."score" = "g"."score")::integer
            from generate_series(1, 10) as "g"("score")
            cross join "mediaRatings" as "s"
            where "s"."mediaId" = "r"."mediaId"
            group by "g"."score"
            order by "g"."score"
          )`.as("scoreCounts"),
        ])
        .groupBy("r.mediaId"),
    )
    .execute()
}
