import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
  await sql`ALTER TYPE "ChapterStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED' BEFORE 'PUBLISHED'`.execute(
    db,
  )

  await db.schema
    .alterTable("chapters")
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
    CREATE INDEX "chapters_publishAt_idx" ON "chapters" ("publishAt")
      WHERE "publishAt" IS NOT NULL AND "deletedAt" IS NULL
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`UPDATE "chapters" SET "status" = 'PENDING' WHERE "status" = 'SCHEDULED'`.execute(db)
  await sql`DROP INDEX IF EXISTS "chapters_publishAt_idx"`.execute(db)
  await sql`
    ALTER TABLE "chapters"
      DROP CONSTRAINT "chapters_isExternal_check",
      DROP CONSTRAINT "chapters_externalUrl_check",
      DROP COLUMN "isExternal",
      DROP COLUMN "externalUrl",
      DROP COLUMN "publishAt"
  `.execute(db)
  await sql`DROP INDEX IF EXISTS "chapters_pending_createdAt_idx"`.execute(db)
  await sql`ALTER TYPE "ChapterStatus" RENAME TO "ChapterStatus_old"`.execute(db)
  await sql`CREATE TYPE "ChapterStatus" AS ENUM ('UPLOADING', 'PENDING', 'PUBLISHED', 'REJECTED')`.execute(
    db,
  )
  await sql`
    ALTER TABLE "chapters"
      ALTER COLUMN "status" DROP DEFAULT,
      ALTER COLUMN "status" TYPE "ChapterStatus" USING "status"::text::"ChapterStatus",
      ALTER COLUMN "status" SET DEFAULT 'PUBLISHED'
  `.execute(db)
  await sql`DROP TYPE "ChapterStatus_old"`.execute(db)
  await sql`
    CREATE INDEX "chapters_pending_createdAt_idx" ON "chapters" ("createdAt")
      WHERE "status" = 'PENDING' AND "deletedAt" IS NULL
  `.execute(db)
}
