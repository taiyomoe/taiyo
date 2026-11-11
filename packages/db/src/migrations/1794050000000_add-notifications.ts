import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable("userLibraryEntries")
    .addColumn("notify", "boolean", (c) => c.notNull().defaultTo(true))
    .execute()

  await db.schema
    .createType("NotificationType")
    .asEnum(["CHAPTER_PUBLISHED", "COMMENT_REPLY"])
    .execute()

  await db.schema
    .createTable("notifications")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("type", sql`"NotificationType"`, (c) => c.notNull())
    .addColumn("chapterId", "uuid", (c) =>
      c.references("chapters.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("commentId", "uuid", (c) =>
      c.references("comments.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("readAt", sql`timestamp(3)`)
    .addCheckConstraint(
      "notifications_subject_check",
      sql`("type" = 'CHAPTER_PUBLISHED' and "chapterId" is not null and "commentId" is null)
        or ("type" = 'COMMENT_REPLY' and "commentId" is not null and "chapterId" is null)`,
    )
    .execute()

  await sql`
    CREATE UNIQUE INDEX "notifications_userId_chapterId_key"
      ON "notifications" ("userId", "chapterId")
      WHERE "chapterId" IS NOT NULL
  `.execute(db)

  await sql`
    CREATE UNIQUE INDEX "notifications_userId_commentId_key"
      ON "notifications" ("userId", "commentId")
      WHERE "commentId" IS NOT NULL
  `.execute(db)

  await sql`
    CREATE INDEX "notifications_userId_createdAt_idx"
      ON "notifications" ("userId", "createdAt" DESC, "id" DESC)
  `.execute(db)

  await sql`
    CREATE INDEX "notifications_userId_unread_idx"
      ON "notifications" ("userId")
      WHERE "readAt" IS NULL
  `.execute(db)

  await db.schema
    .createIndex("notifications_chapterId_idx")
    .on("notifications")
    .column("chapterId")
    .execute()

  await db.schema
    .createIndex("notifications_commentId_idx")
    .on("notifications")
    .column("commentId")
    .execute()

  await db.schema
    .createTable("notificationOutbox")
    .addColumn("id", "bigint", (c) => c.primaryKey().generatedAlwaysAsIdentity())
    .addColumn("chapterId", "uuid", (c) =>
      c.notNull().references("chapters.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await sql`
    CREATE FUNCTION notification_outbox_enqueue_chapter() RETURNS trigger AS $$
    BEGIN
      INSERT INTO "notificationOutbox" ("chapterId") VALUES (NEW.id);

      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  await sql`
    CREATE TRIGGER "chapters_insert_enqueue_notification_outbox"
    AFTER INSERT ON "chapters"
    FOR EACH ROW
    WHEN (NEW."status" = 'PUBLISHED' AND NEW."deletedAt" IS NULL)
    EXECUTE FUNCTION notification_outbox_enqueue_chapter()
  `.execute(db)

  await sql`
    CREATE TRIGGER "chapters_publish_enqueue_notification_outbox"
    AFTER UPDATE OF "status" ON "chapters"
    FOR EACH ROW
    WHEN (
      NEW."status" = 'PUBLISHED'
      AND OLD."status" IS DISTINCT FROM 'PUBLISHED'
      AND NEW."deletedAt" IS NULL
    )
    EXECUTE FUNCTION notification_outbox_enqueue_chapter()
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`DROP TRIGGER "chapters_publish_enqueue_notification_outbox" ON "chapters"`.execute(db)
  await sql`DROP TRIGGER "chapters_insert_enqueue_notification_outbox" ON "chapters"`.execute(db)
  await sql`DROP FUNCTION notification_outbox_enqueue_chapter()`.execute(db)
  await db.schema.dropTable("notificationOutbox").execute()
  await db.schema.dropTable("notifications").execute()
  await db.schema.dropType("NotificationType").execute()
  await db.schema.alterTable("userLibraryEntries").dropColumn("notify").execute()
}
