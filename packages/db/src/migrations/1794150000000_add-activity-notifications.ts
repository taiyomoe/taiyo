import { type Kysely, sql } from "kysely"

const replaceNotificationType = async (db: Kysely<unknown>, values: string[]) => {
  await sql`ALTER TYPE "NotificationType" RENAME TO "NotificationType_old"`.execute(db)
  await sql`CREATE TYPE "NotificationType" AS ENUM (${sql.join(values.map((value) => sql.lit(value)))})`.execute(
    db,
  )
  await sql`
    ALTER TABLE "notifications"
      ALTER COLUMN "type" TYPE "NotificationType" USING "type"::text::"NotificationType"
  `.execute(db)
  await sql`DROP TYPE "NotificationType_old"`.execute(db)
}

export async function up(db: Kysely<unknown>) {
  await sql`ALTER TABLE "notifications" DROP CONSTRAINT "notifications_subject_check"`.execute(db)
  // A type made in this transaction can use its values at once, unlike ADD VALUE.
  await replaceNotificationType(db, [
    "CHAPTER_PUBLISHED",
    "COMMENT_REPLY",
    "COMMENT_LIKE",
    "FOLLOW",
  ])
  await sql`
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_subject_check" CHECK (
      ("type" = 'CHAPTER_PUBLISHED' AND "chapterId" IS NOT NULL AND "commentId" IS NULL)
      OR ("type" IN ('COMMENT_REPLY', 'COMMENT_LIKE') AND "commentId" IS NOT NULL AND "chapterId" IS NULL)
      OR ("type" = 'FOLLOW' AND "commentId" IS NULL AND "chapterId" IS NULL)
    )
  `.execute(db)

  // Likes gather in a new notification once the previous one is read, so only replies stay unique.
  await sql`DROP INDEX "notifications_userId_commentId_key"`.execute(db)
  await sql`
    CREATE UNIQUE INDEX "notifications_userId_commentId_key"
      ON "notifications" ("userId", "commentId")
      WHERE "type" = 'COMMENT_REPLY'
  `.execute(db)

  await db.schema
    .alterTable("notifications")
    .addColumn("lastEventAt", sql`timestamp(3)`, (c) =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute()
  await sql`UPDATE "notifications" SET "lastEventAt" = "createdAt"`.execute(db)
  await sql`DROP INDEX "notifications_userId_createdAt_idx"`.execute(db)
  await sql`
    CREATE INDEX "notifications_userId_lastEventAt_idx"
      ON "notifications" ("userId", "lastEventAt" DESC, "id" DESC)
  `.execute(db)

  await db.schema
    .createTable("notificationActors")
    .addColumn("notificationId", "uuid", (c) =>
      c.notNull().references("notifications.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("actorId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("notificationActors_pkey", ["notificationId", "actorId"])
    .execute()

  await db.schema
    .createIndex("notificationActors_actorId_idx")
    .on("notificationActors")
    .column("actorId")
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("notificationActors").execute()
  await sql`DELETE FROM "notifications" WHERE "type" IN ('COMMENT_LIKE', 'FOLLOW')`.execute(db)
  await sql`DROP INDEX "notifications_userId_lastEventAt_idx"`.execute(db)
  await sql`
    CREATE INDEX "notifications_userId_createdAt_idx"
      ON "notifications" ("userId", "createdAt" DESC, "id" DESC)
  `.execute(db)
  await db.schema.alterTable("notifications").dropColumn("lastEventAt").execute()
  await sql`DROP INDEX "notifications_userId_commentId_key"`.execute(db)
  await sql`
    CREATE UNIQUE INDEX "notifications_userId_commentId_key"
      ON "notifications" ("userId", "commentId")
      WHERE "commentId" IS NOT NULL
  `.execute(db)
  await sql`ALTER TABLE "notifications" DROP CONSTRAINT "notifications_subject_check"`.execute(db)
  await replaceNotificationType(db, ["CHAPTER_PUBLISHED", "COMMENT_REPLY"])
  await sql`
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_subject_check" CHECK (
      ("type" = 'CHAPTER_PUBLISHED' AND "chapterId" IS NOT NULL AND "commentId" IS NULL)
      OR ("type" = 'COMMENT_REPLY' AND "commentId" IS NOT NULL AND "chapterId" IS NULL)
    )
  `.execute(db)
}
