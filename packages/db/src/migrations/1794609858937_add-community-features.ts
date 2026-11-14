import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createType("CommentDeletion")
    .asEnum(["AUTHOR", "PAGE_OWNER", "MODERATOR"])
    .execute()
  await db.schema
    .createType("CommentReportReason")
    .asEnum(["SPAM", "HARASSMENT", "SPOILER", "NSFW", "ILLEGAL", "OTHER"])
    .execute()
  await db.schema
    .createType("CommentReportStatus")
    .asEnum(["OPEN", "RESOLVED", "DISMISSED"])
    .execute()

  await db.schema
    .createTable("commentThreads")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("mediaId", "uuid", (c) =>
      c.unique().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chapterId", "uuid", (c) =>
      c.unique().references("chapters.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("groupId", "uuid", (c) =>
      c.unique().references("groups.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("profileId", "uuid", (c) =>
      c.unique().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addCheckConstraint(
      "commentThreads_one_target_check",
      sql`num_nonnulls("mediaId", "chapterId", "groupId", "profileId") = 1`,
    )
    .execute()

  await db.schema
    .createTable("comments")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("threadId", "uuid", (c) =>
      c.notNull().references("commentThreads.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("parentId", "uuid", (c) =>
      c.references("comments.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("replyToId", "uuid", (c) =>
      c.references("comments.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("authorId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("content", "text", (c) => c.notNull())
    .addColumn("upvoteCount", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("editedAt", sql`timestamp(3)`)
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("deletion", sql`"CommentDeletion"`)
    .addColumn("deleterId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addCheckConstraint("comments_content_check", sql`char_length("content") BETWEEN 1 AND 2400`)
    .addCheckConstraint("comments_upvoteCount_check", sql`"upvoteCount" >= 0`)
    .addCheckConstraint(
      "comments_deletion_check",
      sql`("deletedAt" IS NULL) = ("deletion" IS NULL)`,
    )
    .addCheckConstraint("comments_reply_check", sql`"parentId" IS NOT NULL OR "replyToId" IS NULL`)
    .execute()

  await sql`
    CREATE INDEX "comments_threadId_newest_idx"
      ON "comments" ("threadId", "createdAt" DESC, "id" DESC)
      WHERE "parentId" IS NULL
  `.execute(db)
  await sql`
    CREATE INDEX "comments_threadId_top_idx"
      ON "comments" ("threadId", "upvoteCount" DESC, "createdAt" DESC, "id" DESC)
      WHERE "parentId" IS NULL
  `.execute(db)
  await sql`
    CREATE INDEX "comments_parentId_createdAt_idx"
      ON "comments" ("parentId", "createdAt", "id")
      WHERE "parentId" IS NOT NULL
  `.execute(db)
  await sql`CREATE INDEX "comments_replyToId_idx" ON "comments" ("replyToId")`.execute(db)
  await sql`CREATE INDEX "comments_authorId_createdAt_idx" ON "comments" ("authorId", "createdAt" DESC)`.execute(
    db,
  )
  await sql`
    CREATE TRIGGER "comments_set_updated_at"
    BEFORE UPDATE ON "comments"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)

  await db.schema
    .createTable("commentRevisions")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("commentId", "uuid", (c) =>
      c.notNull().references("comments.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("content", "text", (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull())
    .execute()
  await db.schema
    .createIndex("commentRevisions_commentId_createdAt_idx")
    .on("commentRevisions")
    .columns(["commentId", "createdAt desc"])
    .execute()

  await db.schema
    .createTable("commentVotes")
    .addColumn("commentId", "uuid", (c) =>
      c.notNull().references("comments.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("commentVotes_pkey", ["commentId", "userId"])
    .execute()
  await db.schema
    .createIndex("commentVotes_userId_idx")
    .on("commentVotes")
    .column("userId")
    .execute()

  await db.schema
    .createTable("commentReports")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("commentId", "uuid", (c) =>
      c.notNull().references("comments.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reporterId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reason", sql`"CommentReportReason"`, (c) => c.notNull())
    .addColumn("details", "text", (c) => c.check(sql`char_length("details") <= 500`))
    .addColumn("status", sql`"CommentReportStatus"`, (c) => c.notNull().defaultTo("OPEN"))
    .addColumn("resolverId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("resolvedAt", sql`timestamp(3)`)
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
  await sql`CREATE UNIQUE INDEX "commentReports_open_reporter_comment_key" ON "commentReports" ("reporterId", "commentId") WHERE "status" = 'OPEN'`.execute(
    db,
  )
  await db.schema
    .createIndex("commentReports_status_createdAt_idx")
    .on("commentReports")
    .columns(["status", "createdAt"])
    .execute()
  await db.schema
    .createIndex("commentReports_commentId_idx")
    .on("commentReports")
    .column("commentId")
    .execute()

  await db.schema
    .createTable("commentImages")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("uploaderId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("key", "text", (c) => c.notNull().unique())
    .addColumn("width", "integer", (c) => c.notNull().check(sql`"width" > 0`))
    .addColumn("height", "integer", (c) => c.notNull().check(sql`"height" > 0`))
    .addColumn("animated", "boolean", (c) => c.notNull())
    .addColumn("byteSize", "integer", (c) => c.notNull().check(sql`"byteSize" > 0`))
    .addColumn("sha256", "text", (c) => c.notNull())
    .addColumn("dhash", "bigint", (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("removedAt", sql`timestamp(3)`)
    .addColumn("removerId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .execute()
  await sql`CREATE UNIQUE INDEX "commentImages_uploaderId_sha256_key" ON "commentImages" ("uploaderId", "sha256") WHERE "removedAt" IS NULL`.execute(
    db,
  )
  await sql`CREATE INDEX "commentImages_createdAt_idx" ON "commentImages" ("createdAt") WHERE "removedAt" IS NULL`.execute(
    db,
  )

  await db.schema
    .createTable("commentImageUsages")
    .addColumn("commentId", "uuid", (c) =>
      c.notNull().references("comments.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("imageId", "uuid", (c) =>
      c.notNull().references("commentImages.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addPrimaryKeyConstraint("commentImageUsages_pkey", ["commentId", "imageId"])
    .execute()
  await db.schema
    .createIndex("commentImageUsages_imageId_idx")
    .on("commentImageUsages")
    .column("imageId")
    .execute()

  await db.schema
    .createTable("commentImageFavorites")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("imageId", "uuid", (c) =>
      c.notNull().references("commentImages.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("commentImageFavorites_pkey", ["userId", "imageId"])
    .execute()
  await db.schema
    .createIndex("commentImageFavorites_userId_createdAt_idx")
    .on("commentImageFavorites")
    .columns(["userId", "createdAt desc"])
    .execute()
  await db.schema
    .createIndex("commentImageFavorites_imageId_idx")
    .on("commentImageFavorites")
    .column("imageId")
    .execute()

  await db.schema
    .createTable("blockedCommentImages")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("sha256", "text", (c) => c.notNull().unique())
    .addColumn("dhash", "bigint", (c) => c.notNull())
    .addColumn("width", "integer", (c) => c.notNull().check(sql`"width" > 0`))
    .addColumn("height", "integer", (c) => c.notNull().check(sql`"height" > 0`))
    .addColumn("imageId", "uuid", (c) =>
      c.references("commentImages.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("blockerId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await db.schema
    .alterTable("userLibraryEntries")
    .addColumn("notify", "boolean", (c) => c.notNull().defaultTo(true))
    .execute()

  await db.schema
    .createType("NotificationType")
    .asEnum(["CHAPTER_PUBLISHED", "COMMENT_REPLY", "COMMENT_LIKE", "FOLLOW"])
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
    .addColumn("pushedAt", sql`timestamp(3)`)
    .addColumn("lastEventAt", sql`timestamp(3)`, (c) =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addCheckConstraint(
      "notifications_subject_check",
      sql`("type" = 'CHAPTER_PUBLISHED' AND "chapterId" IS NOT NULL AND "commentId" IS NULL)
        OR ("type" IN ('COMMENT_REPLY', 'COMMENT_LIKE') AND "commentId" IS NOT NULL AND "chapterId" IS NULL)
        OR ("type" = 'FOLLOW' AND "commentId" IS NULL AND "chapterId" IS NULL)`,
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
      WHERE "type" = 'COMMENT_REPLY'
  `.execute(db)

  await sql`
    CREATE INDEX "notifications_userId_lastEventAt_idx"
      ON "notifications" ("userId", "lastEventAt" DESC, "id" DESC)
  `.execute(db)

  await sql`
    CREATE INDEX "notifications_userId_unread_idx"
      ON "notifications" ("userId")
      WHERE "readAt" IS NULL
  `.execute(db)

  await sql`
    CREATE INDEX "notifications_unpushed_idx"
      ON "notifications" ("createdAt")
      WHERE "pushedAt" IS NULL
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

  await db.schema
    .createTable("pushSubscriptions")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("endpoint", "text", (c) => c.notNull().unique())
    .addColumn("p256dh", "text", (c) => c.notNull())
    .addColumn("auth", "text", (c) => c.notNull())
    .addColumn("userAgent", "text")
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await db.schema
    .createIndex("pushSubscriptions_userId_idx")
    .on("pushSubscriptions")
    .column("userId")
    .execute()

  await sql`
    CREATE TRIGGER "pushSubscriptions_set_updated_at"
    BEFORE UPDATE ON "pushSubscriptions"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("pushSubscriptions").execute()
  await sql`DROP TRIGGER "chapters_publish_enqueue_notification_outbox" ON "chapters"`.execute(db)
  await sql`DROP TRIGGER "chapters_insert_enqueue_notification_outbox" ON "chapters"`.execute(db)
  await sql`DROP FUNCTION notification_outbox_enqueue_chapter()`.execute(db)
  await db.schema.dropTable("notificationOutbox").execute()
  await db.schema.dropTable("notificationActors").execute()
  await db.schema.dropTable("notifications").execute()
  await db.schema.dropType("NotificationType").execute()
  await db.schema.alterTable("userLibraryEntries").dropColumn("notify").execute()

  await db.schema.dropTable("blockedCommentImages").execute()
  await db.schema.dropTable("commentImageFavorites").execute()
  await db.schema.dropTable("commentImageUsages").execute()
  await db.schema.dropTable("commentImages").execute()
  await db.schema.dropTable("commentReports").execute()
  await db.schema.dropTable("commentVotes").execute()
  await db.schema.dropTable("commentRevisions").execute()
  await db.schema.dropTable("comments").execute()
  await db.schema.dropTable("commentThreads").execute()
  await db.schema.dropType("CommentReportStatus").execute()
  await db.schema.dropType("CommentReportReason").execute()
  await db.schema.dropType("CommentDeletion").execute()
}
