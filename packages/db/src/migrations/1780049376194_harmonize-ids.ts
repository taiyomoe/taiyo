import { type Kysely, sql } from "kysely"

type MigrationDb = Record<string, Record<string, unknown>>

const UUID_COLUMNS = {
  User: ["id"],
  Account: ["id", "userId"],
  Session: ["userId"],
  UserSetting: ["id", "userId"],
  UserProfile: ["id", "userId"],
  UserHistory: ["mediaId", "userId"],
  UserLibrary: ["userId"],
  _UserFollow: ["A", "B"],
  Media: ["id", "creatorId", "deleterId"],
  MediaCover: ["id", "mediaId", "uploaderId", "deleterId"],
  MediaBanner: ["id", "mediaId", "uploaderId", "deleterId"],
  MediaChapter: ["id", "mediaId", "uploaderId", "deleterId"],
  MediaTitle: ["id", "mediaId", "creatorId", "deleterId"],
  MediaTracker: ["id", "mediaId", "creatorId", "deleterId"],
  Scan: ["id", "creatorId", "deleterId"],
  Task: ["id", "sessionId"],
  _MediaChapterToScan: ["A", "B"],
}

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

  for (const [table, columns] of Object.entries(UUID_COLUMNS)) {
    const changes = columns.flatMap((column) => [
      sql`ALTER COLUMN ${sql.ref(column)} TYPE uuid USING ${sql.ref(column)}::uuid`,
      ...(column === "id" ? [sql`ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`] : []),
    ])

    await sql`ALTER TABLE ${sql.table(table)} ${sql.join(changes)}`.execute(db)
  }

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
