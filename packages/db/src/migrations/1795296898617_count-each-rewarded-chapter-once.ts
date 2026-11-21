import { type Kysely, sql } from "kysely"

// The periods a credited chapter at "at" counts towards, as in the migration creating them.
const periodsOf = (at: string) => `(
  VALUES
    ('DAY'::"ReaderTotalKind", date_trunc('day', ${at})),
    ('WEEK'::"ReaderTotalKind", date_trunc('week', ${at})),
    ('MONTH'::"ReaderTotalKind", date_trunc('month', ${at})),
    ('ALL'::"ReaderTotalKind", timestamp '1970-01-01')
) AS "p"("kind", "startsAt")`
// Whether the reward "r" falls in the period "period".
const inPeriod = (period: string) => `("${period}"."kind" = 'ALL' OR (
  "r"."createdAt" >= "${period}"."startsAt"
  AND "r"."createdAt" < "${period}"."startsAt" + CASE "${period}"."kind"
    WHEN 'DAY' THEN interval '1 day'
    WHEN 'WEEK' THEN interval '7 days'
    ELSE interval '1 month'
  END
))`
/**
 * A chapter read in several sittings is credited several times, one `readingRewards` row each, and
 * counted as many chapters read. Totals now count each chapter once per period: `distinct` is true
 * for the new counting, false to restore the old one.
 */
const countChapters = async (db: Kysely<unknown>, distinct: boolean) => {
  const chapters = distinct ? `count(DISTINCT ("r"."mediaId", "r"."number"))` : `count(*)`
  // Inserted rows only add the chapters their period did not hold yet.
  const added = distinct
    ? `count(DISTINCT ("n"."mediaId", "n"."number")) FILTER (WHERE NOT EXISTS (
        SELECT 1 FROM "readingRewards" AS "r"
        WHERE "r"."userId" = "n"."userId" AND "r"."mediaId" = "n"."mediaId"
          AND "r"."number" = "n"."number" AND "r"."id" NOT IN (SELECT "id" FROM "new_rows")
          AND ${inPeriod("p")}
      ))`
    : `count(*)`

  // Postgres checks the inserted row before turning it into an update on conflict: a credit
  // adding no new chapter to an existing total proposes 0 chapters.
  await sql`ALTER TABLE "readerTotals" DROP CONSTRAINT "readerTotals_chapters_check"`.execute(db)
  await sql`
    ALTER TABLE "readerTotals" ADD CONSTRAINT "readerTotals_chapters_check"
      CHECK ("chapters" ${sql.raw(distinct ? ">=" : ">")} 0)
  `.execute(db)

  await sql`
    CREATE OR REPLACE FUNCTION reader_totals_add() RETURNS trigger AS $$
    BEGIN
      INSERT INTO "readerTotals" ("kind", "startsAt", "userId", "chapters", "pages", "lastAt")
      SELECT "p"."kind", "p"."startsAt", "n"."userId", ${sql.raw(added)}, sum("n"."pages"), max("n"."createdAt")
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

  await sql`
    CREATE OR REPLACE FUNCTION reader_totals_refresh_keys("keys" jsonb) RETURNS void AS $$
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
          WHERE "r"."userId" = "k"."userId" AND ${sql.raw(inPeriod("k"))}
        );

      WITH "k" AS (
        SELECT DISTINCT * FROM jsonb_to_recordset("keys")
          AS "k"("kind" "ReaderTotalKind", "startsAt" timestamp(3), "userId" uuid)
      )
      UPDATE "readerTotals" AS "t"
      SET "chapters" = "s"."chapters", "pages" = "s"."pages", "lastAt" = "s"."lastAt"
      FROM "k"
      CROSS JOIN LATERAL (
        SELECT ${sql.raw(chapters)} AS "chapters", sum("r"."pages") AS "pages", max("r"."createdAt") AS "lastAt"
        FROM "readingRewards" AS "r"
        WHERE "r"."userId" = "k"."userId" AND ${sql.raw(inPeriod("k"))}
      ) AS "s"
      WHERE "t"."kind" = "k"."kind" AND "t"."startsAt" = "k"."startsAt" AND "t"."userId" = "k"."userId";
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  // Recount the totals kept so far. Only their chapters change: pages and dates stay right.
  await sql`
    UPDATE "readerTotals" AS "t"
    SET "chapters" = (
      SELECT ${sql.raw(chapters)}
      FROM "readingRewards" AS "r"
      WHERE "r"."userId" = "t"."userId" AND ${sql.raw(inPeriod("t"))}
    )
    WHERE EXISTS (
      SELECT 1 FROM "readingRewards" AS "r"
      WHERE "r"."userId" = "t"."userId" AND ${sql.raw(inPeriod("t"))}
    )
  `.execute(db)
}

export async function up(db: Kysely<unknown>): Promise<void> {
  await countChapters(db, true)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await countChapters(db, false)
}
