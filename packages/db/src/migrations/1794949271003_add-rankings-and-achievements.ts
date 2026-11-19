import { type Kysely, sql } from "kysely"

// A snapshot of the metric achievements the catalog holds when this migration ships, so users
// already past a threshold get it and its cosmetics. Later catalog changes must not rewrite this
// backfill: an achievement added after it ships brings its own.
const METRIC_ACHIEVEMENTS = [
  { key: "chaptersRead100", metric: "chaptersRead", threshold: 100 },
  { key: "chaptersRead1000", metric: "chaptersRead", threshold: 1000 },
  { key: "chaptersRead5000", metric: "chaptersRead", threshold: 5000 },
  { key: "chaptersUploaded10", metric: "chaptersUploaded", threshold: 10 },
  { key: "chaptersUploaded250", metric: "chaptersUploaded", threshold: 250 },
  { key: "chaptersUploaded100000", metric: "chaptersUploaded", threshold: 100_000 },
  { key: "followers25", metric: "followers", threshold: 25 },
  { key: "commentsWritten50", metric: "commentsWritten", threshold: 50 },
] as const
// The periods a credited chapter at "at" counts towards: its day, week (from Monday), month, and
// all time, which starts at the epoch.
const periodsOf = (at: string) => `(
  VALUES
    ('DAY'::"ReaderTotalKind", date_trunc('day', ${at})),
    ('WEEK'::"ReaderTotalKind", date_trunc('week', ${at})),
    ('MONTH'::"ReaderTotalKind", date_trunc('month', ${at})),
    ('ALL'::"ReaderTotalKind", timestamp '1970-01-01')
) AS "p"("kind", "startsAt")`
// Whether the reward "r" falls in the period of the key "k".
const IN_PERIOD = `("k"."kind" = 'ALL' OR (
  "r"."createdAt" >= "k"."startsAt"
  AND "r"."createdAt" < "k"."startsAt" + CASE "k"."kind"
    WHEN 'DAY' THEN interval '1 day'
    WHEN 'WEEK' THEN interval '7 days'
    ELSE interval '1 month'
  END
))`
/**
 * `readerTotals` keeps, per period and reader, the credited chapters and pages and when the total
 * was reached, so the readers ranking reads an index instead of aggregating `readingRewards`.
 * Triggers keep it in step with every write to `readingRewards`, whatever makes it.
 */
const createReaderTotals = async (db: Kysely<unknown>) => {
  await db.schema.createType("ReaderTotalKind").asEnum(["DAY", "WEEK", "MONTH", "ALL"]).execute()

  await db.schema
    .createTable("readerTotals")
    .addColumn("kind", sql`"ReaderTotalKind"`, (c) => c.notNull())
    .addColumn("startsAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chapters", "integer", (c) => c.notNull().check(sql`"chapters" > 0`))
    .addColumn("pages", "integer", (c) => c.notNull().check(sql`"pages" >= 0`))
    .addColumn("lastAt", sql`timestamp(3)`, (c) => c.notNull())
    .addPrimaryKeyConstraint("readerTotals_pkey", ["kind", "startsAt", "userId"])
    .execute()

  // The readers ranking order: the top 10 and the readers ahead of someone are range scans.
  await sql`
    CREATE INDEX "readerTotals_ranking_idx" ON "readerTotals"
      ("kind", "startsAt", "chapters" DESC, "pages" DESC, "lastAt" ASC, "userId")
  `.execute(db)

  await sql`
    CREATE FUNCTION reader_totals_add() RETURNS trigger AS $$
    BEGIN
      INSERT INTO "readerTotals" ("kind", "startsAt", "userId", "chapters", "pages", "lastAt")
      SELECT "p"."kind", "p"."startsAt", "n"."userId", count(*), sum("n"."pages"), max("n"."createdAt")
      FROM "new_rows" AS "n"
      CROSS JOIN LATERAL ${sql.raw(periodsOf(`"n"."createdAt"`))}
      GROUP BY "p"."kind", "p"."startsAt", "n"."userId"
      ON CONFLICT ("kind", "startsAt", "userId") DO UPDATE SET
        "chapters" = "readerTotals"."chapters" + excluded."chapters",
        "pages" = "readerTotals"."pages" + excluded."pages",
        "lastAt" = greatest("readerTotals"."lastAt", excluded."lastAt");

      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  // Recounts the given keys from what is left in readingRewards. Only existing rows are touched,
  // so totals purged on purpose stay purged.
  await sql`
    CREATE FUNCTION reader_totals_refresh_keys("keys" jsonb) RETURNS void AS $$
    BEGIN
      WITH "k" AS (
        SELECT DISTINCT * FROM jsonb_to_recordset("keys")
          AS "k"("kind" "ReaderTotalKind", "startsAt" timestamp(3), "userId" uuid)
      )
      DELETE FROM "readerTotals" AS "t"
      USING "k"
      WHERE "t"."kind" = "k"."kind" AND "t"."startsAt" = "k"."startsAt" AND "t"."userId" = "k"."userId"
        AND NOT EXISTS (
          SELECT 1 FROM "readingRewards" AS "r"
          WHERE "r"."userId" = "k"."userId" AND ${sql.raw(IN_PERIOD)}
        );

      WITH "k" AS (
        SELECT DISTINCT * FROM jsonb_to_recordset("keys")
          AS "k"("kind" "ReaderTotalKind", "startsAt" timestamp(3), "userId" uuid)
      )
      UPDATE "readerTotals" AS "t"
      SET "chapters" = "s"."chapters", "pages" = "s"."pages", "lastAt" = "s"."lastAt"
      FROM "k"
      CROSS JOIN LATERAL (
        SELECT count(*) AS "chapters", sum("r"."pages") AS "pages", max("r"."createdAt") AS "lastAt"
        FROM "readingRewards" AS "r"
        WHERE "r"."userId" = "k"."userId" AND ${sql.raw(IN_PERIOD)}
      ) AS "s"
      WHERE "t"."kind" = "k"."kind" AND "t"."startsAt" = "k"."startsAt" AND "t"."userId" = "k"."userId";
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  await sql`
    CREATE FUNCTION reader_totals_refresh() RETURNS trigger AS $$
    DECLARE "keys" jsonb;
    BEGIN
      IF TG_OP = 'UPDATE' THEN
        SELECT jsonb_agg(jsonb_build_object('kind', "p"."kind", 'startsAt', "p"."startsAt", 'userId', "o"."userId"))
        INTO "keys"
        FROM (SELECT "userId", "createdAt" FROM "old_rows" UNION SELECT "userId", "createdAt" FROM "new_rows") AS "o"
        CROSS JOIN LATERAL ${sql.raw(periodsOf(`"o"."createdAt"`))};
      ELSE
        SELECT jsonb_agg(jsonb_build_object('kind', "p"."kind", 'startsAt', "p"."startsAt", 'userId', "o"."userId"))
        INTO "keys"
        FROM "old_rows" AS "o"
        CROSS JOIN LATERAL ${sql.raw(periodsOf(`"o"."createdAt"`))};
      END IF;

      IF "keys" IS NOT NULL THEN
        PERFORM reader_totals_refresh_keys("keys");
      END IF;

      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  await sql`
    CREATE TRIGGER "readingRewards_insert_reader_totals"
    AFTER INSERT ON "readingRewards"
    REFERENCING NEW TABLE AS "new_rows"
    FOR EACH STATEMENT
    EXECUTE FUNCTION reader_totals_add()
  `.execute(db)

  await sql`
    CREATE TRIGGER "readingRewards_update_reader_totals"
    AFTER UPDATE ON "readingRewards"
    REFERENCING OLD TABLE AS "old_rows" NEW TABLE AS "new_rows"
    FOR EACH STATEMENT
    EXECUTE FUNCTION reader_totals_refresh()
  `.execute(db)

  await sql`
    CREATE TRIGGER "readingRewards_delete_reader_totals"
    AFTER DELETE ON "readingRewards"
    REFERENCING OLD TABLE AS "old_rows"
    FOR EACH STATEMENT
    EXECUTE FUNCTION reader_totals_refresh()
  `.execute(db)

  // Only what the rankings can still read: all time, and the current and watermark day, week
  // and month. Older periods are closed for good.
  await sql`
    INSERT INTO "readerTotals" ("kind", "startsAt", "userId", "chapters", "pages", "lastAt")
    SELECT "p"."kind", "p"."startsAt", "r"."userId", count(*), sum("r"."pages"), max("r"."createdAt")
    FROM "readingRewards" AS "r"
    CROSS JOIN LATERAL ${sql.raw(periodsOf(`"r"."createdAt"`))}
    WHERE "p"."kind" = 'ALL'
      OR "p"."startsAt" >= (
        SELECT min("w"."startsAt") FROM "rankingPeriods" AS "w" WHERE "w"."kind"::text = "p"."kind"::text
      )
    GROUP BY "p"."kind", "p"."startsAt", "r"."userId"
  `.execute(db)
}

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema.createType("RankingPeriodKind").asEnum(["DAY", "WEEK", "MONTH"]).execute()

  await db.schema
    .createTable("rankingPeriods")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("kind", sql`"RankingPeriodKind"`, (c) => c.notNull())
    .addColumn("startsAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("endsAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("closedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint("rankingPeriods_kind_startsAt_key", ["kind", "startsAt"])
    .addCheckConstraint("rankingPeriods_bounds_check", sql`"endsAt" > "startsAt"`)
    .execute()

  await db.schema
    .createTable("rankingResults")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("periodId", "uuid", (c) =>
      c.notNull().references("rankingPeriods.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("rank", "integer", (c) => c.notNull().check(sql`"rank" > 0`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chapters", "integer", (c) => c.notNull().check(sql`"chapters" > 0`))
    .addColumn("pages", "integer", (c) => c.notNull().check(sql`"pages" >= 0`))
    .addColumn("points", "integer", (c) =>
      c
        .notNull()
        .defaultTo(0)
        .check(sql`"points" >= 0`),
    )
    .addUniqueConstraint("rankingResults_periodId_rank_key", ["periodId", "rank"])
    .addUniqueConstraint("rankingResults_periodId_userId_key", ["periodId", "userId"])
    .execute()

  await db.schema
    .createIndex("rankingResults_userId_idx")
    .on("rankingResults")
    .column("userId")
    .execute()

  // Closures are history: a period and its results never change once written. Deleting a user
  // still removes their results.
  await sql`
    CREATE FUNCTION ranking_history_reject_update() RETURNS trigger AS $$
    BEGIN
      RAISE EXCEPTION '% is immutable: UPDATE is not allowed', TG_TABLE_NAME;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  await sql`
    CREATE TRIGGER "rankingPeriods_immutable"
    BEFORE UPDATE ON "rankingPeriods"
    FOR EACH ROW
    EXECUTE FUNCTION ranking_history_reject_update()
  `.execute(db)

  await sql`
    CREATE TRIGGER "rankingResults_immutable"
    BEFORE UPDATE ON "rankingResults"
    FOR EACH ROW
    EXECUTE FUNCTION ranking_history_reject_update()
  `.execute(db)

  // The watermark: the latest ended period of each kind counts as closed, so the first run only
  // closes periods that end after the deployment and pays nothing retroactively.
  await sql`
    INSERT INTO "rankingPeriods" ("kind", "startsAt", "endsAt")
    SELECT "kind"::"RankingPeriodKind", "end" - "length", "end"
    FROM (
      VALUES
        ('DAY', date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC'), interval '1 day'),
        ('WEEK', date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'UTC'), interval '7 days'),
        ('MONTH', date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'UTC'), interval '1 month')
    ) AS "w"("kind", "end", "length")
  `.execute(db)

  await db.schema
    .createTable("userAchievements")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("key", "text", (c) => c.notNull())
    .addColumn("count", "integer", (c) =>
      c
        .notNull()
        .defaultTo(1)
        .check(sql`"count" > 0`),
    )
    .addColumn("firstEarnedAt", sql`timestamp(3)`, (c) =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn("lastEarnedAt", sql`timestamp(3)`, (c) =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addPrimaryKeyConstraint("userAchievements_pkey", ["userId", "key"])
    .execute()

  // Users already past a threshold keep what they unlocked: chapters read takes the larger of the
  // completed chapters the unlock used to count and the credited chapters it counts from now on.
  await sql`
    INSERT INTO "userAchievements" ("userId", "key")
    SELECT "m"."userId", "a"."key"
    FROM (
      SELECT
        "u"."id" AS "userId",
        greatest(
          (SELECT count(*) FROM "userHistories" AS "h" WHERE "h"."userId" = "u"."id" AND "h"."completed"),
          (SELECT count(*) FROM "readingRewards" AS "r" WHERE "r"."userId" = "u"."id")
        ) AS "chaptersRead",
        (
          SELECT count(*) FROM "chapters" AS "c"
          WHERE "c"."uploaderId" = "u"."id" AND "c"."deletedAt" IS NULL AND "c"."status" = 'PUBLISHED'
        ) AS "chaptersUploaded",
        (
          SELECT count(*) FROM "userFollows" AS "f"
          INNER JOIN "users" AS "fu" ON "fu"."id" = "f"."followerId"
          WHERE "f"."followingId" = "u"."id"
            AND NOT (
              coalesce("fu"."banned", false)
              AND ("fu"."banExpires" IS NULL OR "fu"."banExpires" > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'))
            )
        ) AS "followers",
        (
          SELECT count(*) FROM "comments" AS "cm"
          WHERE "cm"."authorId" = "u"."id" AND "cm"."deletedAt" IS NULL
        ) AS "commentsWritten"
      FROM "users" AS "u"
    ) AS "m"
    CROSS JOIN (
      VALUES ${sql.join(
        METRIC_ACHIEVEMENTS.map(
          ({ key, metric, threshold }) => sql`(${key}, ${metric}, ${threshold}::int)`,
        ),
      )}
    ) AS "a"("key", "metric", "threshold")
    WHERE CASE "a"."metric"
      WHEN 'chaptersRead' THEN "m"."chaptersRead"
      WHEN 'chaptersUploaded' THEN "m"."chaptersUploaded"
      WHEN 'followers' THEN "m"."followers"
      ELSE "m"."commentsWritten"
    END >= "a"."threshold"
  `.execute(db)

  // New enum values cannot be used in the transaction that adds them, so the subject check
  // compares the type as text.
  await sql`ALTER TYPE "NotificationType" ADD VALUE 'RANKING_REWARD'`.execute(db)
  await sql`ALTER TYPE "NotificationType" ADD VALUE 'ACHIEVEMENT_EARNED'`.execute(db)

  await db.schema
    .alterTable("notifications")
    .addColumn("rankingResultId", "uuid", (c) =>
      c.references("rankingResults.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("achievement", "text")
    .execute()

  await db.schema
    .alterTable("notifications")
    .dropConstraint("notifications_subject_check")
    .execute()

  await sql`
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_subject_check" CHECK (
      num_nonnulls("chapterId", "commentId", "rankingResultId", "achievement") = CASE "type"::text
        WHEN 'FOLLOW' THEN 0
        ELSE 1
      END
      AND CASE "type"::text
        WHEN 'CHAPTER_PUBLISHED' THEN "chapterId" IS NOT NULL
        WHEN 'COMMENT_REPLY' THEN "commentId" IS NOT NULL
        WHEN 'COMMENT_LIKE' THEN "commentId" IS NOT NULL
        WHEN 'RANKING_REWARD' THEN "rankingResultId" IS NOT NULL
        WHEN 'ACHIEVEMENT_EARNED' THEN "achievement" IS NOT NULL
        ELSE true
      END
    )
  `.execute(db)

  await db.schema
    .createIndex("notifications_rankingResultId_idx")
    .on("notifications")
    .column("rankingResultId")
    .execute()

  // The medias ranking aggregates the credited chapters of a period: an index-only scan by time.
  await sql`
    CREATE INDEX "readingRewards_createdAt_idx"
      ON "readingRewards" ("createdAt") INCLUDE ("userId", "mediaId", "pages")
  `.execute(db)

  await createReaderTotals(db)

  // The groups ranking counts published chapters by publication time.
  await sql`
    CREATE INDEX "chapters_published_createdAt_idx"
      ON "chapters" ("createdAt") INCLUDE ("mediaId")
      WHERE "status" = 'PUBLISHED' AND "deletedAt" IS NULL
  `.execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX "chapters_published_createdAt_idx"`.execute(db)

  await sql`DROP TRIGGER "readingRewards_insert_reader_totals" ON "readingRewards"`.execute(db)
  await sql`DROP TRIGGER "readingRewards_update_reader_totals" ON "readingRewards"`.execute(db)
  await sql`DROP TRIGGER "readingRewards_delete_reader_totals" ON "readingRewards"`.execute(db)
  await sql`DROP FUNCTION reader_totals_add()`.execute(db)
  await sql`DROP FUNCTION reader_totals_refresh()`.execute(db)
  await sql`DROP FUNCTION reader_totals_refresh_keys(jsonb)`.execute(db)
  await db.schema.dropTable("readerTotals").execute()
  await db.schema.dropType("ReaderTotalKind").execute()

  await db.schema.dropIndex("readingRewards_createdAt_idx").execute()

  await sql`DELETE FROM "notifications" WHERE "type"::text IN ('RANKING_REWARD', 'ACHIEVEMENT_EARNED')`.execute(
    db,
  )

  await db.schema
    .alterTable("notifications")
    .dropConstraint("notifications_subject_check")
    .execute()

  await db.schema
    .alterTable("notifications")
    .dropColumn("achievement")
    .dropColumn("rankingResultId")
    .execute()

  await sql`ALTER TYPE "NotificationType" RENAME TO "NotificationType_old"`.execute(db)

  await db.schema
    .createType("NotificationType")
    .asEnum(["CHAPTER_PUBLISHED", "COMMENT_REPLY", "COMMENT_LIKE", "FOLLOW"])
    .execute()

  await sql`DROP INDEX "notifications_userId_commentId_key"`.execute(db)

  await sql`
    ALTER TABLE "notifications"
      ALTER COLUMN "type" TYPE "NotificationType" USING "type"::text::"NotificationType"
  `.execute(db)

  await sql`DROP TYPE "NotificationType_old"`.execute(db)

  await sql`
    CREATE UNIQUE INDEX "notifications_userId_commentId_key"
      ON "notifications" ("userId", "commentId")
      WHERE "type" = 'COMMENT_REPLY'
  `.execute(db)

  await sql`
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_subject_check" CHECK (
      ("type" = 'CHAPTER_PUBLISHED' AND "chapterId" IS NOT NULL AND "commentId" IS NULL)
      OR ("type" IN ('COMMENT_REPLY', 'COMMENT_LIKE') AND "commentId" IS NOT NULL AND "chapterId" IS NULL)
      OR ("type" = 'FOLLOW' AND "commentId" IS NULL AND "chapterId" IS NULL)
    )
  `.execute(db)

  await db.schema.dropTable("userAchievements").execute()

  await db.schema.dropTable("rankingResults").execute()

  await db.schema.dropTable("rankingPeriods").execute()

  await sql`DROP FUNCTION ranking_history_reject_update()`.execute(db)

  await db.schema.dropType("RankingPeriodKind").execute()
}
