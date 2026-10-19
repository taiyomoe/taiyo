import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TYPE "ChapterStatus" ADD VALUE IF NOT EXISTS 'UPLOADING' BEFORE 'PENDING'`.execute(
    db,
  )
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`UPDATE "chapters" SET "status" = 'PENDING' WHERE "status" = 'UPLOADING'`.execute(db)
  await sql`DROP INDEX IF EXISTS "chapters_pending_createdAt_idx"`.execute(db)
  await sql`ALTER TYPE "ChapterStatus" RENAME TO "ChapterStatus_old"`.execute(db)
  await sql`CREATE TYPE "ChapterStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED')`.execute(db)
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
