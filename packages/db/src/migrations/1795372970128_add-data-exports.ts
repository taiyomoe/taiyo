import { type Kysely, sql } from "kysely"

type MigrationDb = {
  notifications: { type: string }
}

export async function up(db: Kysely<MigrationDb>): Promise<void> {
  await sql`ALTER TYPE "NotificationType" ADD VALUE 'DATA_EXPORT_READY'`.execute(db)

  await db.schema
    .createType("DataExportStatus")
    .asEnum(["PENDING", "READY", "FAILED", "EXPIRED"])
    .execute()

  await db.schema
    .createTable("dataExports")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("status", sql`"DataExportStatus"`, (c) => c.notNull().defaultTo("PENDING"))
    .addColumn("byteSize", "bigint")
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("finishedAt", sql`timestamp(3)`)
    .addColumn("expiresAt", sql`timestamp(3)`)
    .execute()

  await db.schema
    .createIndex("dataExports_userId_createdAt_idx")
    .on("dataExports")
    .columns(["userId", "createdAt desc"])
    .execute()

  await db.schema
    .createIndex("dataExports_status_expiresAt_idx")
    .on("dataExports")
    .columns(["status", "expiresAt"])
    .execute()
}

export async function down(db: Kysely<MigrationDb>): Promise<void> {
  await db.deleteFrom("notifications").where("type", "=", "DATA_EXPORT_READY").execute()

  await db.schema.dropTable("dataExports").execute()
  await db.schema.dropType("DataExportStatus").execute()

  // Postgres cannot drop an enum value: the type is rebuilt without it.
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
      "LIST_MODERATED",
      "PROFILE_MODERATED",
      "REPORT_REVIEWED",
    ])
    .execute()

  await db.schema.dropIndex("notifications_userId_commentId_key").execute()

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
}
