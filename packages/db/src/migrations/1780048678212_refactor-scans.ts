import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  /**
   * Phase 0: Drop unused tables (MediaChapterComment, ScanMember, _ScanToScanMember).
   */
  await db.schema
    .alterTable("MediaChapterComment")
    .dropConstraint("MediaChapterComment_parentId_fkey")
    .execute()

  await db.schema
    .alterTable("_ScanToScanMember")
    .dropConstraint("_ScanToScanMember_B_fkey")
    .execute()

  await db.schema.dropTable("MediaChapterComment").execute()

  await db.schema.dropTable("ScanMember").execute()

  await db.schema.dropTable("_ScanToScanMember").execute()

  /**
   * Phase 1: Rename Scan to Group.
   */
  await db.schema.alterType("ScanMemberRoles").renameTo("GroupMemberRoles").execute()

  await db.schema.alterType("ScanMemberPermissions").renameTo("GroupMemberPermissions").execute()

  await db.schema.alterTable("Scan").renameTo("Group").execute()

  await db.schema.alterTable("_MediaChapterToScan").renameTo("_MediaChapterToGroup").execute()

  await db.schema.alterTable("Group").renameColumn("twitter", "x").execute()

  await db.schema.alterTable("Group").renameConstraint("Scan_pkey", "Group_pkey").execute()

  await db.schema
    .alterTable("Group")
    .renameConstraint("Scan_creatorId_fkey", "Group_creatorId_fkey")
    .execute()

  await db.schema
    .alterTable("_MediaChapterToGroup")
    .renameConstraint("_MediaChapterToScan_A_fkey", "_MediaChapterToGroup_A_fkey")
    .execute()

  await db.schema
    .alterTable("_MediaChapterToGroup")
    .renameConstraint("_MediaChapterToScan_B_fkey", "_MediaChapterToGroup_B_fkey")
    .execute()

  await db.schema
    .alterTable("_MediaChapterToGroup")
    .renameConstraint("_MediaChapterToScan_AB_pkey", "_MediaChapterToGroup_AB_pkey")
    .execute()

  await sql`ALTER INDEX "_MediaChapterToScan_B_index" RENAME TO "_MediaChapterToGroup_B_index"`.execute(
    db,
  )

  /**
   * Phase 2: Strip "Media" prefix from related tables.
   */
  // MediaBanner
  await db.schema.alterTable("MediaBanner").renameTo("Banner").execute()

  await db.schema.alterTable("Banner").renameConstraint("MediaBanner_pkey", "Banner_pkey").execute()

  await db.schema
    .alterTable("Banner")
    .renameConstraint("MediaBanner_mediaId_fkey", "Banner_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("Banner")
    .renameConstraint("MediaBanner_uploaderId_fkey", "Banner_uploaderId_fkey")
    .execute()

  // MediaChapter
  await db.schema.alterTable("MediaChapter").renameTo("Chapter").execute()

  await db.schema
    .alterTable("Chapter")
    .renameConstraint("MediaChapter_pkey", "Chapter_pkey")
    .execute()

  await db.schema
    .alterTable("Chapter")
    .renameConstraint("MediaChapter_mediaId_fkey", "Chapter_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("Chapter")
    .renameConstraint("MediaChapter_uploaderId_fkey", "Chapter_uploaderId_fkey")
    .execute()

  // MediaCover
  await db.schema.alterTable("MediaCover").renameTo("Cover").execute()

  await db.schema.alterTable("Cover").renameConstraint("MediaCover_pkey", "Cover_pkey").execute()

  await db.schema
    .alterTable("Cover")
    .renameConstraint("MediaCover_mediaId_fkey", "Cover_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("Cover")
    .renameConstraint("MediaCover_uploaderId_fkey", "Cover_uploaderId_fkey")
    .execute()

  // MediaTitle
  await db.schema.alterTable("MediaTitle").renameTo("Title").execute()

  await db.schema.alterTable("Title").renameConstraint("MediaTitle_pkey", "Title_pkey").execute()

  await sql`ALTER INDEX "MediaTitle_mediaId_language_priority_key" RENAME TO "Title_mediaId_language_priority_key"`.execute(
    db,
  )
  await db.schema
    .alterTable("Title")
    .renameConstraint("MediaTitle_mediaId_fkey", "Title_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("Title")
    .renameConstraint("MediaTitle_creatorId_fkey", "Title_creatorId_fkey")
    .execute()

  // MediaTracker
  await db.schema.alterTable("MediaTracker").renameTo("Tracker").execute()

  await db.schema
    .alterTable("Tracker")
    .renameConstraint("MediaTracker_pkey", "Tracker_pkey")
    .execute()

  await db.schema
    .alterTable("Tracker")
    .renameConstraint("MediaTracker_mediaId_fkey", "Tracker_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("Tracker")
    .renameConstraint("MediaTracker_creatorId_fkey", "Tracker_creatorId_fkey")
    .execute()

  // _MediaChapterToGroup
  await db.schema.alterTable("_MediaChapterToGroup").renameTo("_ChapterToGroup").execute()

  await db.schema
    .alterTable("_ChapterToGroup")
    .renameConstraint("_MediaChapterToGroup_AB_pkey", "_ChapterToGroup_AB_pkey")
    .execute()

  await sql`ALTER INDEX "_MediaChapterToGroup_B_index" RENAME TO "_ChapterToGroup_B_index"`.execute(
    db,
  )
  await db.schema
    .alterTable("_ChapterToGroup")
    .renameConstraint("_MediaChapterToGroup_A_fkey", "_ChapterToGroup_A_fkey")
    .execute()

  await db.schema
    .alterTable("_ChapterToGroup")
    .renameConstraint("_MediaChapterToGroup_B_fkey", "_ChapterToGroup_B_fkey")
    .execute()
}

export async function down(): Promise<void> {
  throw new Error("refactor-scans is a destructive data-type migration and cannot be reversed")
}
