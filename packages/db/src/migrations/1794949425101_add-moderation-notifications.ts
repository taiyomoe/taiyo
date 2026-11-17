import { type Kysely, sql } from "kysely"

const MODERATION_TYPES = ["LIST_MODERATED", "PROFILE_MODERATED", "REPORT_REVIEWED"]

/** The subject check before this migration: one subject per type, none for follows. */
const addSubjectCheckWithoutPayload = (db: Kysely<unknown>) =>
  sql`
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

export async function up(db: Kysely<unknown>): Promise<void> {
  // New enum values cannot be used in the transaction that adds them, so the subject check
  // compares the type as text.
  for (const type of MODERATION_TYPES) {
    await sql`ALTER TYPE "NotificationType" ADD VALUE ${sql.lit(type)}`.execute(db)
  }

  // Each moderation type carries different facts (a list and what happened to it, the parts of
  // a profile that changed, a report's kind, outcome and target), so they share one JSON column
  // rather than a nullable column per fact. Without foreign keys, the notice outlives what it is
  // about, and tells that it is gone.
  await db.schema.alterTable("notifications").addColumn("payload", "jsonb").execute()

  await db.schema
    .alterTable("notifications")
    .dropConstraint("notifications_subject_check")
    .execute()

  await sql`
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_subject_check" CHECK (
      num_nonnulls("chapterId", "commentId", "rankingResultId", "achievement", "payload") = CASE "type"::text
        WHEN 'FOLLOW' THEN 0
        ELSE 1
      END
      AND CASE "type"::text
        WHEN 'CHAPTER_PUBLISHED' THEN "chapterId" IS NOT NULL
        WHEN 'COMMENT_REPLY' THEN "commentId" IS NOT NULL
        WHEN 'COMMENT_LIKE' THEN "commentId" IS NOT NULL
        WHEN 'RANKING_REWARD' THEN "rankingResultId" IS NOT NULL
        WHEN 'ACHIEVEMENT_EARNED' THEN "achievement" IS NOT NULL
        WHEN 'LIST_MODERATED' THEN jsonb_typeof("payload") = 'object'
        WHEN 'PROFILE_MODERATED' THEN jsonb_typeof("payload") = 'object'
        WHEN 'REPORT_REVIEWED' THEN jsonb_typeof("payload") = 'object'
        ELSE true
      END
    )
  `.execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DELETE FROM "notifications" WHERE "type"::text IN (${sql.join(MODERATION_TYPES)})`.execute(
    db,
  )

  await db.schema
    .alterTable("notifications")
    .dropConstraint("notifications_subject_check")
    .execute()

  await db.schema.alterTable("notifications").dropColumn("payload").execute()

  // Postgres cannot drop an enum value: the type is rebuilt without the moderation ones.
  await sql`ALTER TYPE "NotificationType" RENAME TO "NotificationType_old"`.execute(db)

  await db.schema
    .createType("NotificationType")
    .asEnum([
      "CHAPTER_PUBLISHED",
      "COMMENT_REPLY",
      "COMMENT_LIKE",
      "FOLLOW",
      "RANKING_REWARD",
      "ACHIEVEMENT_EARNED",
    ])
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

  await addSubjectCheckWithoutPayload(db)
}
