import { type Kysely, sql } from "kysely"

const createdAt = sql`timestamp(3)`

export async function up(db: Kysely<unknown>) {
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
    .addColumn("createdAt", createdAt, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
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
    .addColumn("createdAt", createdAt, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", createdAt, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("editedAt", createdAt)
    .addColumn("deletedAt", createdAt)
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
    .addColumn("createdAt", createdAt, (c) => c.notNull())
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
    .addColumn("createdAt", createdAt, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
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
    .addColumn("resolvedAt", createdAt)
    .addColumn("createdAt", createdAt, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
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
    .addColumn("createdAt", createdAt, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("removedAt", createdAt)
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
    .addColumn("createdAt", createdAt, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
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
    .addColumn("createdAt", createdAt, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
}

export async function down(db: Kysely<unknown>) {
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
