import { type Kysely, sql } from "kysely"

type MigrationDb = Record<string, Record<string, unknown>>

export async function up(db: Kysely<MigrationDb>): Promise<void> {
  await db.schema.alterTable("Account").dropConstraint("Account_userId_fkey").execute()

  await db.schema.alterTable("Session").dropConstraint("Session_userId_fkey").execute()

  await db.schema.alterTable("UserSetting").dropConstraint("UserSetting_userId_fkey").execute()

  await db.schema.alterTable("UserProfile").dropConstraint("UserProfile_userId_fkey").execute()

  await db.schema.alterTable("UserHistory").dropConstraint("UserHistory_userId_fkey").execute()

  await db.schema.alterTable("UserLibrary").dropConstraint("UserLibrary_userId_fkey").execute()

  await db.schema.alterTable("_UserFollow").dropConstraint("_UserFollow_A_fkey").execute()

  await db.schema.alterTable("_UserFollow").dropConstraint("_UserFollow_B_fkey").execute()

  await db.schema.alterTable("Media").dropConstraint("Media_creatorId_fkey").execute()

  await db.schema.alterTable("MediaCover").dropConstraint("MediaCover_uploaderId_fkey").execute()

  await db.schema.alterTable("MediaBanner").dropConstraint("MediaBanner_uploaderId_fkey").execute()

  await db.schema
    .alterTable("MediaChapter")
    .dropConstraint("MediaChapter_uploaderId_fkey")
    .execute()

  await db.schema.alterTable("MediaTitle").dropConstraint("MediaTitle_creatorId_fkey").execute()

  await db.schema.alterTable("MediaTracker").dropConstraint("MediaTracker_creatorId_fkey").execute()

  await db.schema.alterTable("Scan").dropConstraint("Scan_creatorId_fkey").execute()

  await db.schema.alterTable("ScanMember").dropConstraint("ScanMember_userId_fkey").execute()

  await db.schema
    .alterTable("MediaChapterComment")
    .dropConstraint("MediaChapterComment_userId_fkey")
    .execute()

  await db.schema.alterTable("UserHistory").dropConstraint("UserHistory_mediaId_fkey").execute()

  await db.schema.alterTable("MediaCover").dropConstraint("MediaCover_mediaId_fkey").execute()

  await db.schema.alterTable("MediaBanner").dropConstraint("MediaBanner_mediaId_fkey").execute()

  await db.schema.alterTable("MediaChapter").dropConstraint("MediaChapter_mediaId_fkey").execute()

  await db.schema.alterTable("MediaTitle").dropConstraint("MediaTitle_mediaId_fkey").execute()

  await db.schema.alterTable("MediaTracker").dropConstraint("MediaTracker_mediaId_fkey").execute()

  await db.schema
    .alterTable("_MediaChapterToScan")
    .dropConstraint("_MediaChapterToScan_A_fkey")
    .execute()

  await db.schema
    .alterTable("_MediaChapterToScan")
    .dropConstraint("_MediaChapterToScan_B_fkey")
    .execute()

  await db.schema
    .alterTable("MediaChapterComment")
    .dropConstraint("MediaChapterComment_mediaChapterId_fkey")
    .execute()

  await db.schema
    .alterTable("_ScanToScanMember")
    .dropConstraint("_ScanToScanMember_A_fkey")
    .execute()

  await sql`
    ALTER TABLE "User"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid()
  `.execute(db)

  await sql`
    ALTER TABLE "Account"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "Session"
      ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "UserSetting"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "UserProfile"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "UserHistory"
      ALTER COLUMN "mediaId" TYPE uuid USING "mediaId"::uuid,
      ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "UserLibrary"
      ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "_UserFollow"
      ALTER COLUMN "A" TYPE uuid USING "A"::uuid,
      ALTER COLUMN "B" TYPE uuid USING "B"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "Media"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "creatorId" TYPE uuid USING "creatorId"::uuid,
      ALTER COLUMN "deleterId" TYPE uuid USING "deleterId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "MediaCover"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "mediaId" TYPE uuid USING "mediaId"::uuid,
      ALTER COLUMN "uploaderId" TYPE uuid USING "uploaderId"::uuid,
      ALTER COLUMN "deleterId" TYPE uuid USING "deleterId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "MediaBanner"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "mediaId" TYPE uuid USING "mediaId"::uuid,
      ALTER COLUMN "uploaderId" TYPE uuid USING "uploaderId"::uuid,
      ALTER COLUMN "deleterId" TYPE uuid USING "deleterId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "MediaChapter"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "mediaId" TYPE uuid USING "mediaId"::uuid,
      ALTER COLUMN "uploaderId" TYPE uuid USING "uploaderId"::uuid,
      ALTER COLUMN "deleterId" TYPE uuid USING "deleterId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "MediaTitle"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "mediaId" TYPE uuid USING "mediaId"::uuid,
      ALTER COLUMN "creatorId" TYPE uuid USING "creatorId"::uuid,
      ALTER COLUMN "deleterId" TYPE uuid USING "deleterId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "MediaTracker"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "mediaId" TYPE uuid USING "mediaId"::uuid,
      ALTER COLUMN "creatorId" TYPE uuid USING "creatorId"::uuid,
      ALTER COLUMN "deleterId" TYPE uuid USING "deleterId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "Scan"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "creatorId" TYPE uuid USING "creatorId"::uuid,
      ALTER COLUMN "deleterId" TYPE uuid USING "deleterId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "Task"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
      ALTER COLUMN "sessionId" TYPE uuid USING "sessionId"::uuid
  `.execute(db)

  await sql`
    ALTER TABLE "_MediaChapterToScan"
      ALTER COLUMN "A" TYPE uuid USING "A"::uuid,
      ALTER COLUMN "B" TYPE uuid USING "B"::uuid
  `.execute(db)

  await db.schema.dropIndex("User_id_idx").execute()

  await db.schema
    .alterTable("Account")
    .addForeignKeyConstraint("Account_userId_fkey", ["userId"], "User", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("Session")
    .addForeignKeyConstraint("Session_userId_fkey", ["userId"], "User", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("UserSetting")
    .addForeignKeyConstraint("UserSetting_userId_fkey", ["userId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("UserProfile")
    .addForeignKeyConstraint("UserProfile_userId_fkey", ["userId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("UserHistory")
    .addForeignKeyConstraint("UserHistory_userId_fkey", ["userId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("UserLibrary")
    .addForeignKeyConstraint("UserLibrary_userId_fkey", ["userId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("_UserFollow")
    .addForeignKeyConstraint("_UserFollow_A_fkey", ["A"], "User", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("_UserFollow")
    .addForeignKeyConstraint("_UserFollow_B_fkey", ["B"], "User", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("Media")
    .addForeignKeyConstraint("Media_creatorId_fkey", ["creatorId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("MediaCover")
    .addForeignKeyConstraint("MediaCover_uploaderId_fkey", ["uploaderId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("MediaBanner")
    .addForeignKeyConstraint("MediaBanner_uploaderId_fkey", ["uploaderId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("MediaChapter")
    .addForeignKeyConstraint("MediaChapter_uploaderId_fkey", ["uploaderId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("MediaTitle")
    .addForeignKeyConstraint("MediaTitle_creatorId_fkey", ["creatorId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("MediaTracker")
    .addForeignKeyConstraint("MediaTracker_creatorId_fkey", ["creatorId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("Scan")
    .addForeignKeyConstraint("Scan_creatorId_fkey", ["creatorId"], "User", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("UserHistory")
    .addForeignKeyConstraint("UserHistory_mediaId_fkey", ["mediaId"], "Media", ["id"])
    .onDelete("restrict")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("MediaCover")
    .addForeignKeyConstraint("MediaCover_mediaId_fkey", ["mediaId"], "Media", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("MediaBanner")
    .addForeignKeyConstraint("MediaBanner_mediaId_fkey", ["mediaId"], "Media", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("MediaChapter")
    .addForeignKeyConstraint("MediaChapter_mediaId_fkey", ["mediaId"], "Media", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("MediaTitle")
    .addForeignKeyConstraint("MediaTitle_mediaId_fkey", ["mediaId"], "Media", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("MediaTracker")
    .addForeignKeyConstraint("MediaTracker_mediaId_fkey", ["mediaId"], "Media", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("_MediaChapterToScan")
    .addForeignKeyConstraint("_MediaChapterToScan_A_fkey", ["A"], "MediaChapter", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("_MediaChapterToScan")
    .addForeignKeyConstraint("_MediaChapterToScan_B_fkey", ["B"], "Scan", ["id"])
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}

export function down(): Promise<void> {
  return Promise.reject(
    new Error("harmonize-ids is a destructive data-type migration and cannot be reversed"),
  )
}
