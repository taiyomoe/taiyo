import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  /**
   * Phase 1: User-side conversions.
   */
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

  // Account
  await db.schema.alterTable("Account").dropConstraint("Account_pkey").execute()

  await db.schema.alterTable("Account").renameColumn("id", "idTemp").execute()

  await db.schema.alterTable("Account").renameColumn("userId", "userIdTemp").execute()

  await db.schema
    .alterTable("Account")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid")
    .execute()

  await db
    .updateTable("Account")
    .set({ id: sql`"idTemp"::UUID`, userId: sql`"userIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("Account").dropColumn("idTemp").execute()

  await db.schema.alterTable("Account").dropColumn("userIdTemp").execute()

  await db.schema
    .alterTable("Account")
    .alterColumn("userId", (c) => c.setNotNull())
    .execute()

  await db.schema.alterTable("Account").addPrimaryKeyConstraint("Account_pkey", ["id"]).execute()

  // Session
  await db.schema.alterTable("Session").renameColumn("userId", "userIdTemp").execute()

  await db.schema.alterTable("Session").addColumn("userId", "uuid").execute()

  await db
    .updateTable("Session")
    .set({ userId: sql`"userIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("Session").dropColumn("userIdTemp").execute()

  await db.schema
    .alterTable("Session")
    .alterColumn("userId", (c) => c.setNotNull())
    .execute()

  // UserSetting
  await db.schema.alterTable("UserSetting").dropConstraint("UserSetting_pkey").execute()

  await db.schema.alterTable("UserSetting").renameColumn("id", "idTemp").execute()

  await db.schema.alterTable("UserSetting").renameColumn("userId", "userIdTemp").execute()

  await db.schema
    .alterTable("UserSetting")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid")
    .execute()

  await db
    .updateTable("UserSetting")
    .set({ id: sql`"idTemp"::UUID`, userId: sql`"userIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("UserSetting").dropColumn("idTemp").execute()

  await db.schema.alterTable("UserSetting").dropColumn("userIdTemp").execute()

  await db.schema
    .alterTable("UserSetting")
    .alterColumn("userId", (c) => c.setNotNull())
    .execute()

  await db.schema
    .alterTable("UserSetting")
    .addPrimaryKeyConstraint("UserSetting_pkey", ["id"])
    .execute()

  // UserProfile
  await db.schema.alterTable("UserProfile").dropConstraint("UserProfile_pkey").execute()

  await db.schema.alterTable("UserProfile").renameColumn("id", "idTemp").execute()

  await db.schema.alterTable("UserProfile").renameColumn("userId", "userIdTemp").execute()

  await db.schema
    .alterTable("UserProfile")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid")
    .execute()

  await db
    .updateTable("UserProfile")
    .set({ id: sql`"idTemp"::UUID`, userId: sql`"userIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("UserProfile").dropColumn("idTemp").execute()

  await db.schema.alterTable("UserProfile").dropColumn("userIdTemp").execute()

  await db.schema
    .alterTable("UserProfile")
    .alterColumn("userId", (c) => c.setNotNull())
    .execute()

  await db.schema
    .alterTable("UserProfile")
    .addPrimaryKeyConstraint("UserProfile_pkey", ["id"])
    .execute()

  // UserHistory
  await db.schema.alterTable("UserHistory").renameColumn("userId", "userIdTemp").execute()

  await db.schema.alterTable("UserHistory").addColumn("userId", "uuid").execute()

  await db
    .updateTable("UserHistory")
    .set({ userId: sql`"userIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("UserHistory").dropColumn("userIdTemp").execute()

  await db.schema
    .alterTable("UserHistory")
    .alterColumn("userId", (c) => c.setNotNull())
    .execute()

  // UserLibrary
  await db.schema.alterTable("UserLibrary").renameColumn("userId", "userIdTemp").execute()

  await db.schema.alterTable("UserLibrary").addColumn("userId", "uuid").execute()

  await db
    .updateTable("UserLibrary")
    .set({ userId: sql`"userIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("UserLibrary").dropColumn("userIdTemp").execute()

  await db.schema
    .alterTable("UserLibrary")
    .alterColumn("userId", (c) => c.setNotNull())
    .execute()

  // _UserFollow
  await db.schema.alterTable("_UserFollow").dropConstraint("_UserFollow_AB_pkey").execute()

  await db.schema.alterTable("_UserFollow").renameColumn("A", "ATemp").execute()

  await db.schema.alterTable("_UserFollow").renameColumn("B", "BTemp").execute()

  await db.schema.alterTable("_UserFollow").addColumn("A", "uuid").addColumn("B", "uuid").execute()

  await db
    .updateTable("_UserFollow")
    .set({ A: sql`"ATemp"::UUID`, B: sql`"BTemp"::UUID` })
    .execute()

  await db.schema.alterTable("_UserFollow").dropColumn("ATemp").execute()

  await db.schema.alterTable("_UserFollow").dropColumn("BTemp").execute()

  await db.schema
    .alterTable("_UserFollow")
    .alterColumn("A", (c) => c.setNotNull())
    .alterColumn("B", (c) => c.setNotNull())
    .execute()

  await db.schema
    .alterTable("_UserFollow")
    .addPrimaryKeyConstraint("_UserFollow_AB_pkey", ["A", "B"])
    .execute()

  // Media
  await db.schema.alterTable("Media").renameColumn("creatorId", "creatorIdTemp").execute()

  await db.schema.alterTable("Media").renameColumn("deleterId", "deleterIdTemp").execute()

  await db.schema
    .alterTable("Media")
    .addColumn("creatorId", "uuid")
    .addColumn("deleterId", "uuid")
    .execute()

  await db
    .updateTable("Media")
    .set({ creatorId: sql`"creatorIdTemp"::UUID`, deleterId: sql`"deleterIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("Media").dropColumn("creatorIdTemp").execute()

  await db.schema.alterTable("Media").dropColumn("deleterIdTemp").execute()

  await db.schema
    .alterTable("Media")
    .alterColumn("creatorId", (c) => c.setNotNull())
    .execute()

  // MediaCover
  await db.schema.alterTable("MediaCover").renameColumn("uploaderId", "uploaderIdTemp").execute()

  await db.schema.alterTable("MediaCover").renameColumn("deleterId", "deleterIdTemp").execute()

  await db.schema
    .alterTable("MediaCover")
    .addColumn("uploaderId", "uuid")
    .addColumn("deleterId", "uuid")
    .execute()

  await db
    .updateTable("MediaCover")
    .set({ uploaderId: sql`"uploaderIdTemp"::UUID`, deleterId: sql`"deleterIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("MediaCover").dropColumn("uploaderIdTemp").execute()

  await db.schema.alterTable("MediaCover").dropColumn("deleterIdTemp").execute()

  await db.schema
    .alterTable("MediaCover")
    .alterColumn("uploaderId", (c) => c.setNotNull())
    .execute()

  // MediaBanner
  await db.schema.alterTable("MediaBanner").renameColumn("uploaderId", "uploaderIdTemp").execute()

  await db.schema.alterTable("MediaBanner").renameColumn("deleterId", "deleterIdTemp").execute()

  await db.schema
    .alterTable("MediaBanner")
    .addColumn("uploaderId", "uuid")
    .addColumn("deleterId", "uuid")
    .execute()

  await db
    .updateTable("MediaBanner")
    .set({ uploaderId: sql`"uploaderIdTemp"::UUID`, deleterId: sql`"deleterIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("MediaBanner").dropColumn("uploaderIdTemp").execute()

  await db.schema.alterTable("MediaBanner").dropColumn("deleterIdTemp").execute()

  await db.schema
    .alterTable("MediaBanner")
    .alterColumn("uploaderId", (c) => c.setNotNull())
    .execute()

  // MediaChapter
  await db.schema.alterTable("MediaChapter").renameColumn("uploaderId", "uploaderIdTemp").execute()

  await db.schema.alterTable("MediaChapter").renameColumn("deleterId", "deleterIdTemp").execute()

  await db.schema
    .alterTable("MediaChapter")
    .addColumn("uploaderId", "uuid")
    .addColumn("deleterId", "uuid")
    .execute()

  await db
    .updateTable("MediaChapter")
    .set({ uploaderId: sql`"uploaderIdTemp"::UUID`, deleterId: sql`"deleterIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("MediaChapter").dropColumn("uploaderIdTemp").execute()

  await db.schema.alterTable("MediaChapter").dropColumn("deleterIdTemp").execute()

  await db.schema
    .alterTable("MediaChapter")
    .alterColumn("uploaderId", (c) => c.setNotNull())
    .execute()

  // MediaTitle
  await db.schema.alterTable("MediaTitle").renameColumn("creatorId", "creatorIdTemp").execute()

  await db.schema.alterTable("MediaTitle").renameColumn("deleterId", "deleterIdTemp").execute()

  await db.schema
    .alterTable("MediaTitle")
    .addColumn("creatorId", "uuid")
    .addColumn("deleterId", "uuid")
    .execute()

  await db
    .updateTable("MediaTitle")
    .set({ creatorId: sql`"creatorIdTemp"::UUID`, deleterId: sql`"deleterIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("MediaTitle").dropColumn("creatorIdTemp").execute()

  await db.schema.alterTable("MediaTitle").dropColumn("deleterIdTemp").execute()

  await db.schema
    .alterTable("MediaTitle")
    .alterColumn("creatorId", (c) => c.setNotNull())
    .execute()

  // MediaTracker
  await db.schema.alterTable("MediaTracker").renameColumn("creatorId", "creatorIdTemp").execute()

  await db.schema.alterTable("MediaTracker").renameColumn("deleterId", "deleterIdTemp").execute()

  await db.schema
    .alterTable("MediaTracker")
    .addColumn("creatorId", "uuid")
    .addColumn("deleterId", "uuid")
    .execute()

  await db
    .updateTable("MediaTracker")
    .set({ creatorId: sql`"creatorIdTemp"::UUID`, deleterId: sql`"deleterIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("MediaTracker").dropColumn("creatorIdTemp").execute()

  await db.schema.alterTable("MediaTracker").dropColumn("deleterIdTemp").execute()

  await db.schema
    .alterTable("MediaTracker")
    .alterColumn("creatorId", (c) => c.setNotNull())
    .execute()

  // Scan
  await db.schema.alterTable("Scan").renameColumn("creatorId", "creatorIdTemp").execute()

  await db.schema.alterTable("Scan").renameColumn("deleterId", "deleterIdTemp").execute()

  await db.schema
    .alterTable("Scan")
    .addColumn("creatorId", "uuid")
    .addColumn("deleterId", "uuid")
    .execute()

  await db
    .updateTable("Scan")
    .set({ creatorId: sql`"creatorIdTemp"::UUID`, deleterId: sql`"deleterIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("Scan").dropColumn("creatorIdTemp").execute()

  await db.schema.alterTable("Scan").dropColumn("deleterIdTemp").execute()

  await db.schema
    .alterTable("Scan")
    .alterColumn("creatorId", (c) => c.setNotNull())
    .execute()

  // User
  await db.schema.alterTable("User").renameColumn("id", "idTemp").execute()

  await db.schema
    .alterTable("User")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .execute()

  await db
    .updateTable("User")
    .set({ id: sql`"idTemp"::UUID` })
    .execute()

  await db.schema.alterTable("User").dropColumn("idTemp").execute()

  await db.schema.alterTable("User").addPrimaryKeyConstraint("User_pkey", ["id"]).execute()

  // Recreate user-related indexes
  await db.schema
    .createIndex("UserSetting_userId_key")
    .on("UserSetting")
    .column("userId")
    .unique()
    .execute()

  await db.schema
    .createIndex("UserProfile_userId_key")
    .on("UserProfile")
    .column("userId")
    .unique()
    .execute()

  await db.schema
    .createIndex("UserHistory_mediaId_userId_key")
    .on("UserHistory")
    .columns(["mediaId", "userId"])
    .unique()
    .execute()

  await db.schema
    .createIndex("UserLibrary_userId_key")
    .on("UserLibrary")
    .column("userId")
    .unique()
    .execute()

  await db.schema.createIndex("_UserFollow_B_index").on("_UserFollow").column("B").execute()

  // Recreate user-related FKs
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

  /**
   * Phase 2: Media-side conversions.
   */
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

  // UserHistory
  await db.schema.alterTable("UserHistory").renameColumn("mediaId", "mediaIdTemp").execute()

  await db.schema.alterTable("UserHistory").addColumn("mediaId", "uuid").execute()

  await db
    .updateTable("UserHistory")
    .set({ mediaId: sql`"mediaIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("UserHistory").dropColumn("mediaIdTemp").execute()

  await db.schema
    .alterTable("UserHistory")
    .alterColumn("mediaId", (c) => c.setNotNull())
    .execute()

  // MediaCover
  await db.schema.alterTable("MediaCover").dropConstraint("MediaCover_pkey").execute()

  await db.schema.alterTable("MediaCover").renameColumn("id", "idTemp").execute()

  await db.schema.alterTable("MediaCover").renameColumn("mediaId", "mediaIdTemp").execute()

  await db.schema
    .alterTable("MediaCover")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("mediaId", "uuid")
    .execute()

  await db
    .updateTable("MediaCover")
    .set({ id: sql`"idTemp"::UUID`, mediaId: sql`"mediaIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("MediaCover").dropColumn("idTemp").execute()

  await db.schema.alterTable("MediaCover").dropColumn("mediaIdTemp").execute()

  await db.schema
    .alterTable("MediaCover")
    .alterColumn("mediaId", (c) => c.setNotNull())
    .execute()

  await db.schema
    .alterTable("MediaCover")
    .addPrimaryKeyConstraint("MediaCover_pkey", ["id"])
    .execute()

  // MediaBanner
  await db.schema.alterTable("MediaBanner").dropConstraint("MediaBanner_pkey").execute()

  await db.schema.alterTable("MediaBanner").renameColumn("id", "idTemp").execute()

  await db.schema.alterTable("MediaBanner").renameColumn("mediaId", "mediaIdTemp").execute()

  await db.schema
    .alterTable("MediaBanner")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("mediaId", "uuid")
    .execute()

  await db
    .updateTable("MediaBanner")
    .set({ id: sql`"idTemp"::UUID`, mediaId: sql`"mediaIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("MediaBanner").dropColumn("idTemp").execute()

  await db.schema.alterTable("MediaBanner").dropColumn("mediaIdTemp").execute()

  await db.schema
    .alterTable("MediaBanner")
    .alterColumn("mediaId", (c) => c.setNotNull())
    .execute()

  await db.schema
    .alterTable("MediaBanner")
    .addPrimaryKeyConstraint("MediaBanner_pkey", ["id"])
    .execute()

  // MediaChapter
  await db.schema.alterTable("MediaChapter").dropConstraint("MediaChapter_pkey").execute()

  await db.schema.alterTable("MediaChapter").renameColumn("id", "idTemp").execute()

  await db.schema.alterTable("MediaChapter").renameColumn("mediaId", "mediaIdTemp").execute()

  await db.schema
    .alterTable("MediaChapter")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("mediaId", "uuid")
    .execute()

  await db
    .updateTable("MediaChapter")
    .set({ id: sql`"idTemp"::UUID`, mediaId: sql`"mediaIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("MediaChapter").dropColumn("idTemp").execute()

  await db.schema.alterTable("MediaChapter").dropColumn("mediaIdTemp").execute()

  await db.schema
    .alterTable("MediaChapter")
    .alterColumn("mediaId", (c) => c.setNotNull())
    .execute()

  await db.schema
    .alterTable("MediaChapter")
    .addPrimaryKeyConstraint("MediaChapter_pkey", ["id"])
    .execute()

  // MediaTitle
  await db.schema.alterTable("MediaTitle").dropConstraint("MediaTitle_pkey").execute()

  await db.schema.alterTable("MediaTitle").renameColumn("id", "idTemp").execute()

  await db.schema.alterTable("MediaTitle").renameColumn("mediaId", "mediaIdTemp").execute()

  await db.schema
    .alterTable("MediaTitle")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("mediaId", "uuid")
    .execute()

  await db
    .updateTable("MediaTitle")
    .set({ id: sql`"idTemp"::UUID`, mediaId: sql`"mediaIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("MediaTitle").dropColumn("idTemp").execute()

  await db.schema.alterTable("MediaTitle").dropColumn("mediaIdTemp").execute()

  await db.schema
    .alterTable("MediaTitle")
    .alterColumn("mediaId", (c) => c.setNotNull())
    .execute()

  await db.schema
    .alterTable("MediaTitle")
    .addPrimaryKeyConstraint("MediaTitle_pkey", ["id"])
    .execute()

  // MediaTracker
  await db.schema.alterTable("MediaTracker").dropConstraint("MediaTracker_pkey").execute()

  await db.schema.alterTable("MediaTracker").renameColumn("id", "idTemp").execute()

  await db.schema.alterTable("MediaTracker").renameColumn("mediaId", "mediaIdTemp").execute()

  await db.schema
    .alterTable("MediaTracker")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("mediaId", "uuid")
    .execute()

  await db
    .updateTable("MediaTracker")
    .set({ id: sql`"idTemp"::UUID`, mediaId: sql`"mediaIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("MediaTracker").dropColumn("idTemp").execute()

  await db.schema.alterTable("MediaTracker").dropColumn("mediaIdTemp").execute()

  await db.schema
    .alterTable("MediaTracker")
    .alterColumn("mediaId", (c) => c.setNotNull())
    .execute()

  await db.schema
    .alterTable("MediaTracker")
    .addPrimaryKeyConstraint("MediaTracker_pkey", ["id"])
    .execute()

  // Scan
  await db.schema.alterTable("Scan").dropConstraint("Scan_pkey").execute()

  await db.schema.alterTable("Scan").renameColumn("id", "idTemp").execute()

  await db.schema
    .alterTable("Scan")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .execute()

  await db
    .updateTable("Scan")
    .set({ id: sql`"idTemp"::UUID` })
    .execute()

  await db.schema.alterTable("Scan").dropColumn("idTemp").execute()

  await db.schema.alterTable("Scan").addPrimaryKeyConstraint("Scan_pkey", ["id"]).execute()

  // Task
  await db.schema.alterTable("Task").dropConstraint("Task_pkey").execute()

  await db.schema.alterTable("Task").renameColumn("id", "idTemp").execute()

  await db.schema.alterTable("Task").renameColumn("sessionId", "sessionIdTemp").execute()

  await db.schema
    .alterTable("Task")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("sessionId", "uuid")
    .execute()

  await db
    .updateTable("Task")
    .set({ id: sql`"idTemp"::UUID`, sessionId: sql`"sessionIdTemp"::UUID` })
    .execute()

  await db.schema.alterTable("Task").dropColumn("idTemp").execute()

  await db.schema.alterTable("Task").dropColumn("sessionIdTemp").execute()

  await db.schema
    .alterTable("Task")
    .alterColumn("sessionId", (c) => c.setNotNull())
    .execute()

  await db.schema.alterTable("Task").addPrimaryKeyConstraint("Task_pkey", ["id"]).execute()

  // _MediaChapterToScan
  await db.schema
    .alterTable("_MediaChapterToScan")
    .dropConstraint("_MediaChapterToScan_AB_pkey")
    .execute()

  await db.schema.alterTable("_MediaChapterToScan").renameColumn("A", "ATemp").execute()

  await db.schema.alterTable("_MediaChapterToScan").renameColumn("B", "BTemp").execute()

  await db.schema
    .alterTable("_MediaChapterToScan")
    .addColumn("A", "uuid")
    .addColumn("B", "uuid")
    .execute()

  await db
    .updateTable("_MediaChapterToScan")
    .set({ A: sql`"ATemp"::UUID`, B: sql`"BTemp"::UUID` })
    .execute()

  await db.schema.alterTable("_MediaChapterToScan").dropColumn("ATemp").execute()

  await db.schema.alterTable("_MediaChapterToScan").dropColumn("BTemp").execute()

  await db.schema
    .alterTable("_MediaChapterToScan")
    .alterColumn("A", (c) => c.setNotNull())
    .alterColumn("B", (c) => c.setNotNull())
    .execute()

  await db.schema
    .alterTable("_MediaChapterToScan")
    .addPrimaryKeyConstraint("_MediaChapterToScan_AB_pkey", ["A", "B"])
    .execute()

  // Media
  await db.schema.alterTable("Media").dropConstraint("Media_pkey").execute()

  await db.schema.alterTable("Media").renameColumn("id", "idTemp").execute()

  await db.schema
    .alterTable("Media")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .execute()

  await db
    .updateTable("Media")
    .set({ id: sql`"idTemp"::UUID` })
    .execute()

  await db.schema.alterTable("Media").dropColumn("idTemp").execute()

  await db.schema.alterTable("Media").addPrimaryKeyConstraint("Media_pkey", ["id"]).execute()

  // Recreate media-related indexes
  await db.schema
    .createIndex("MediaTitle_mediaId_language_priority_key")
    .on("MediaTitle")
    .columns(["mediaId", "language", "priority"])
    .unique()
    .execute()

  await db.schema
    .createIndex("_MediaChapterToScan_B_index")
    .on("_MediaChapterToScan")
    .column("B")
    .execute()

  // Recreate media-related FKs
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

export async function down(): Promise<void> {
  throw new Error("harmonize-ids is a destructive data-type migration and cannot be reversed")
}
