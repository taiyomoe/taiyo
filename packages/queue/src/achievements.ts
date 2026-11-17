import {
  type AchievementMetric,
  type AchievementProgress,
  type DB,
  isBannedSql,
  METRIC_ACHIEVEMENTS,
} from "@taiyomoe/db"
import { type Kysely, type RawBuilder, sql } from "kysely"

/** The current value of each metric for one user, as a scalar subquery. */
const metricSql = (userId: string): Record<AchievementMetric, RawBuilder<string>> => ({
  chaptersRead: sql`(select count(*) from "readingRewards" where "userId" = ${userId})`,
  chaptersUploaded: sql`(
    select count(*) from "chapters"
    where "uploaderId" = ${userId} and "deletedAt" is null and "status" = 'PUBLISHED'
  )`,
  followers: sql`(
    select count(*) from "userFollows"
    inner join "users" on "users"."id" = "userFollows"."followerId"
    where "userFollows"."followingId" = ${userId} and not (${isBannedSql})
  )`,
  commentsWritten: sql`(
    select count(*) from "comments" where "authorId" = ${userId} and "deletedAt" is null
  )`,
})

/** A user's value for every achievement metric, in one round trip. */
export const getAchievementProgress = async (db: Kysely<DB>, userId: string) => {
  const metrics = metricSql(userId)
  const row = await db
    .selectNoFrom([
      metrics.chaptersRead.as("chaptersRead"),
      metrics.chaptersUploaded.as("chaptersUploaded"),
      metrics.followers.as("followers"),
      metrics.commentsWritten.as("commentsWritten"),
    ])
    .executeTakeFirstOrThrow()

  return {
    chaptersRead: Number(row.chaptersRead),
    chaptersUploaded: Number(row.chaptersUploaded),
    followers: Number(row.followers),
    commentsWritten: Number(row.commentsWritten),
  } satisfies AchievementProgress
}

/**
 * Awards every metric achievement the user has reached and does not hold yet, in one statement:
 * it stores them, notifies the user and credits their points. Run it in the transaction that moved
 * the metric. Resolves the keys of the achievements just earned.
 */
export const awardMetricAchievements = async (db: Kysely<DB>, userId: string) => {
  const metrics = metricSql(userId)
  const { rows } = await sql<{ key: string }>`
    with "progress" as (
      select
        ${metrics.chaptersRead} as "chaptersRead",
        ${metrics.chaptersUploaded} as "chaptersUploaded",
        ${metrics.followers} as "followers",
        ${metrics.commentsWritten} as "commentsWritten"
    ),
    "reached" as (
      select "a"."key", "a"."points"
      from (
        values ${sql.join(
          METRIC_ACHIEVEMENTS.map(
            ({ key, metric, threshold, points }) =>
              sql`(${key}, ${metric}, ${threshold}::bigint, ${points}::int)`,
          ),
        )}
      ) as "a"("key", "metric", "threshold", "points")
      cross join "progress" as "p"
      where case "a"."metric"
          when 'chaptersRead' then "p"."chaptersRead"
          when 'chaptersUploaded' then "p"."chaptersUploaded"
          when 'followers' then "p"."followers"
          else "p"."commentsWritten"
        end >= "a"."threshold"
    ),
    "earned" as (
      insert into "userAchievements" ("userId", "key")
      select ${userId}, "key" from "reached"
      on conflict do nothing
      returning "key"
    ),
    "notified" as (
      insert into "notifications" ("userId", "type", "achievement")
      select ${userId}, 'ACHIEVEMENT_EARNED', "key" from "earned"
    ),
    "credited" as (
      insert into "userProfiles" ("userId", "points")
      select ${userId}, sum("reached"."points")
      from "earned" inner join "reached" on "reached"."key" = "earned"."key"
      having sum("reached"."points") > 0
      on conflict ("userId") do update set "points" = "userProfiles"."points" + excluded."points"
    )
    select "key" from "earned"
  `.execute(db)

  return rows.map(({ key }) => key)
}
