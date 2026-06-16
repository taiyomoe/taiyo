import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  // Indexes on FK columns that every list endpoint filters by. Postgres
  // doesn't auto-create indexes for foreign keys; without these, list-by-
  // media is a sequential scan.
  await db.schema.createIndex("chapters_mediaId_idx").on("chapters").column("mediaId").execute()
  await db.schema.createIndex("covers_mediaId_idx").on("covers").column("mediaId").execute()
  await db.schema.createIndex("banners_mediaId_idx").on("banners").column("mediaId").execute()

  // requireChapterAccess (group-ownership Phase 3) joins chapterGroups to
  // groupMemberships filtered by userId. The PK (userId, groupId) supports
  // lookups starting from userId already, but Postgres can pick the index
  // shape it prefers — making it explicit also unlocks the "what groups is
  // this user in?" query the design doc calls out.
  await db.schema
    .createIndex("groupMemberships_userId_idx")
    .on("groupMemberships")
    .column("userId")
    .execute()

  // Exactly one main cover per media. set-main-cover's read-then-write race
  // can otherwise leave two covers flagged as main.
  await sql`
    CREATE UNIQUE INDEX "covers_mediaId_main_unique"
      ON "covers" ("mediaId")
      WHERE "isMainCover" = true AND "deletedAt" IS NULL
  `.execute(db)
}

export async function down(): Promise<void> {
  throw new Error("add-missing-indexes-and-invariants cannot be reversed")
}
