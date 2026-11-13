import { type Kysely, sql } from "kysely"

// Chapters: review queue, upload status, scheduling and external links.

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createType("ChapterStatus")
    .asEnum(["UPLOADING", "PENDING", "SCHEDULED", "PUBLISHED", "REJECTED"])
    .execute()

  await db.schema
    .alterTable("chapters")
    .addColumn("status", sql`"ChapterStatus"`, (c) => c.notNull().defaultTo("PUBLISHED"))
    .addColumn("reviewerId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("reviewedAt", sql`timestamp(3)`)
    .addColumn("rejectionReason", "text")
    .addColumn("publishAt", sql`timestamp(3)`)
    .addColumn("externalUrl", "text")
    .addColumn("isExternal", "boolean", (c) => c.notNull().defaultTo(false))
    .execute()

  await sql`
    ALTER TABLE "chapters"
      ADD CONSTRAINT "chapters_externalUrl_check" CHECK ("externalUrl" IS NULL OR "externalUrl" ~* '^https?://'),
      ADD CONSTRAINT "chapters_isExternal_check" CHECK (NOT "isExternal" OR "externalUrl" IS NOT NULL)
  `.execute(db)

  await sql`
    CREATE INDEX "chapters_pending_createdAt_idx" ON "chapters" ("createdAt")
      WHERE "status" = 'PENDING' AND "deletedAt" IS NULL
  `.execute(db)

  await db.schema
    .createIndex("chapters_uploaderId_status_idx")
    .on("chapters")
    .columns(["uploaderId", "status"])
    .execute()

  await sql`
    CREATE INDEX "chapters_publishAt_idx" ON "chapters" ("publishAt")
      WHERE "publishAt" IS NOT NULL AND "deletedAt" IS NULL
  `.execute(db)
}

// Dropping the columns drops their indexes and check constraints with them.
export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("chapters")
    .dropColumn("isExternal")
    .dropColumn("externalUrl")
    .dropColumn("publishAt")
    .dropColumn("rejectionReason")
    .dropColumn("reviewedAt")
    .dropColumn("reviewerId")
    .dropColumn("status")
    .execute()

  await db.schema.dropType("ChapterStatus").execute()
}
