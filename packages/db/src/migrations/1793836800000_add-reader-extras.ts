import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable("users").addColumn("readerSettings", "jsonb").execute()

  await db.schema
    .createTable("pageBookmarks")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chapterId", "uuid", (c) =>
      c.notNull().references("chapters.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("pageId", "uuid", (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint("pageBookmarks_userId_chapterId_pageId_key", [
      "userId",
      "chapterId",
      "pageId",
    ])
    .execute()

  await db.schema
    .createIndex("pageBookmarks_userId_createdAt_idx")
    .on("pageBookmarks")
    .columns(["userId", "createdAt desc"])
    .execute()

  await db.schema
    .createType("PageReportReason")
    .asEnum(["BROKEN", "WRONG_ORDER", "WRONG_CHAPTER", "LOW_QUALITY", "OTHER"])
    .execute()

  await db.schema.createType("PageReportStatus").asEnum(["OPEN", "RESOLVED", "DISMISSED"]).execute()

  await db.schema
    .createTable("pageReports")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("reporterId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chapterId", "uuid", (c) =>
      c.notNull().references("chapters.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("pageId", "uuid", (c) => c.notNull())
    .addColumn("reason", sql`"PageReportReason"`, (c) => c.notNull())
    .addColumn("comment", "text", (c) => c.check(sql`char_length("comment") <= 500`))
    .addColumn("status", sql`"PageReportStatus"`, (c) => c.notNull().defaultTo("OPEN"))
    .addColumn("resolverId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("resolvedAt", sql`timestamp(3)`)
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await sql`CREATE UNIQUE INDEX "pageReports_open_reporter_page_key" ON "pageReports" ("reporterId", "chapterId", "pageId") WHERE "status" = 'OPEN'`.execute(
    db,
  )

  await db.schema
    .createIndex("pageReports_status_createdAt_idx")
    .on("pageReports")
    .columns(["status", "createdAt"])
    .execute()

  await db.schema
    .createIndex("pageReports_chapterId_idx")
    .on("pageReports")
    .column("chapterId")
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("pageReports").execute()
  await db.schema.dropType("PageReportStatus").execute()
  await db.schema.dropType("PageReportReason").execute()
  await db.schema.dropTable("pageBookmarks").execute()
  await db.schema.alterTable("users").dropColumn("readerSettings").execute()
}
