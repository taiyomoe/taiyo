import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW."updatedAt" = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  const installUpdatedAt = async (table: string) => {
    await db.schema
      .alterTable(table)
      .alterColumn("updatedAt", (c) => c.setDefault(sql`CURRENT_TIMESTAMP`))
      .execute()

    await sql`
      CREATE TRIGGER ${sql.raw(`"${table}_set_updated_at"`)}
      BEFORE UPDATE ON ${sql.id(table)}
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `.execute(db)
  }

  // User
  await db.schema.alterTable("User").renameTo("users").execute()

  await db.schema.alterTable("users").renameConstraint("User_pkey", "users_pkey").execute()

  await sql`ALTER INDEX "User_email_key" RENAME TO "users_email_key"`.execute(db)
  await sql`ALTER INDEX "User_username_key" RENAME TO "users_username_key"`.execute(db)
  await sql`ALTER INDEX "User_displayUsername_key" RENAME TO "users_displayUsername_key"`.execute(
    db,
  )
  await installUpdatedAt("users")

  // UserProfile
  await db.schema.alterTable("UserProfile").renameTo("userProfiles").execute()

  await db.schema
    .alterTable("userProfiles")
    .renameConstraint("UserProfile_pkey", "userProfiles_pkey")
    .execute()

  await db.schema
    .alterTable("userProfiles")
    .renameConstraint("UserProfile_userId_fkey", "userProfiles_userId_fkey")
    .execute()

  await sql`ALTER INDEX "UserProfile_userId_key" RENAME TO "userProfiles_userId_key"`.execute(db)
  await installUpdatedAt("userProfiles")

  // UserLibrary
  await db.schema.alterTable("UserLibrary").renameTo("userLibraries").execute()

  await db.schema
    .alterTable("userLibraries")
    .renameConstraint("UserLibrary_userId_fkey", "userLibraries_userId_fkey")
    .execute()

  await sql`ALTER INDEX "UserLibrary_userId_key" RENAME TO "userLibraries_userId_key"`.execute(db)

  // _UserFollow
  await db.schema.alterTable("_UserFollow").renameTo("userFollows").execute()

  await db.schema.alterTable("userFollows").renameColumn("A", "followerId").execute()

  await db.schema.alterTable("userFollows").renameColumn("B", "followingId").execute()

  await db.schema
    .alterTable("userFollows")
    .renameConstraint("_UserFollow_AB_pkey", "userFollows_pkey")
    .execute()

  await db.schema
    .alterTable("userFollows")
    .renameConstraint("_UserFollow_A_fkey", "userFollows_followerId_fkey")
    .execute()

  await db.schema
    .alterTable("userFollows")
    .renameConstraint("_UserFollow_B_fkey", "userFollows_followingId_fkey")
    .execute()

  await sql`ALTER INDEX "_UserFollow_B_index" RENAME TO "userFollows_followingId_index"`.execute(db)

  // Account
  await db.schema.alterTable("Account").renameTo("accounts").execute()

  await db.schema.alterTable("accounts").renameConstraint("Account_pkey", "accounts_pkey").execute()

  await db.schema
    .alterTable("accounts")
    .renameConstraint("Account_userId_fkey", "accounts_userId_fkey")
    .execute()

  await sql`ALTER INDEX "Account_accountId_providerId_userId_key" RENAME TO "accounts_accountId_providerId_userId_key"`.execute(
    db,
  )
  await installUpdatedAt("accounts")

  // Session
  await db.schema.alterTable("Session").renameTo("sessions").execute()

  await db.schema.alterTable("sessions").renameConstraint("Session_pkey", "sessions_pkey").execute()

  await db.schema
    .alterTable("sessions")
    .renameConstraint("Session_userId_fkey", "sessions_userId_fkey")
    .execute()

  await sql`ALTER INDEX "Session_token_key" RENAME TO "sessions_token_key"`.execute(db)
  await installUpdatedAt("sessions")

  // Verification
  await db.schema.alterTable("Verification").renameTo("verifications").execute()

  await db.schema
    .alterTable("verifications")
    .renameConstraint("Verification_pkey", "verifications_pkey")
    .execute()

  await installUpdatedAt("verifications")

  // Group
  await db.schema.alterTable("Group").renameTo("groups").execute()

  await db.schema.alterTable("groups").renameConstraint("Group_pkey", "groups_pkey").execute()

  await db.schema
    .alterTable("groups")
    .renameConstraint("Group_creatorId_fkey", "groups_creatorId_fkey")
    .execute()

  await installUpdatedAt("groups")

  // Staff
  await db.schema.alterTable("Staff").renameTo("staffs").execute()

  await db.schema.alterTable("staffs").renameConstraint("Staff_pkey", "staffs_pkey").execute()

  await db.schema
    .alterTable("staffs")
    .renameConstraint("Staff_creatorId_fkey", "staffs_creatorId_fkey")
    .execute()

  await installUpdatedAt("staffs")

  // Media
  await db.schema.alterTable("Media").renameTo("medias").execute()

  await db.schema.alterTable("medias").renameConstraint("Media_pkey", "medias_pkey").execute()

  await db.schema
    .alterTable("medias")
    .renameConstraint("Media_creatorId_fkey", "medias_creatorId_fkey")
    .execute()

  await installUpdatedAt("medias")

  // UserHistory
  await db.schema.alterTable("UserHistory").renameTo("userHistories").execute()

  await db.schema
    .alterTable("userHistories")
    .renameConstraint("UserHistory_mediaId_fkey", "userHistories_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("userHistories")
    .renameConstraint("UserHistory_userId_fkey", "userHistories_userId_fkey")
    .execute()

  await db.schema
    .createIndex("userHistories_mediaId_userId_key")
    .on("userHistories")
    .columns(["mediaId", "userId"])
    .unique()
    .execute()

  // Banner
  await db.schema.alterTable("Banner").renameTo("banners").execute()

  await db.schema.alterTable("banners").renameConstraint("Banner_pkey", "banners_pkey").execute()

  await db.schema
    .alterTable("banners")
    .renameConstraint("Banner_mediaId_fkey", "banners_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("banners")
    .renameConstraint("Banner_uploaderId_fkey", "banners_uploaderId_fkey")
    .execute()

  await installUpdatedAt("banners")

  // Cover
  await db.schema.alterTable("Cover").renameTo("covers").execute()

  await db.schema.alterTable("covers").renameConstraint("Cover_pkey", "covers_pkey").execute()

  await db.schema
    .alterTable("covers")
    .renameConstraint("Cover_mediaId_fkey", "covers_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("covers")
    .renameConstraint("Cover_uploaderId_fkey", "covers_uploaderId_fkey")
    .execute()

  await installUpdatedAt("covers")

  // Title
  await db.schema.alterTable("Title").renameTo("titles").execute()

  await db.schema.alterTable("titles").renameConstraint("Title_pkey", "titles_pkey").execute()

  await db.schema
    .alterTable("titles")
    .renameConstraint("Title_mediaId_fkey", "titles_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("titles")
    .renameConstraint("Title_creatorId_fkey", "titles_creatorId_fkey")
    .execute()

  await sql`ALTER INDEX "Title_mediaId_language_priority_key" RENAME TO "titles_mediaId_language_priority_key"`.execute(
    db,
  )

  await installUpdatedAt("titles")

  // Chapter
  await db.schema.alterTable("Chapter").renameTo("chapters").execute()

  await db.schema.alterTable("chapters").renameConstraint("Chapter_pkey", "chapters_pkey").execute()

  await db.schema
    .alterTable("chapters")
    .renameConstraint("Chapter_mediaId_fkey", "chapters_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("chapters")
    .renameConstraint("Chapter_uploaderId_fkey", "chapters_uploaderId_fkey")
    .execute()

  await installUpdatedAt("chapters")

  // _ChapterToGroup
  await db.schema.alterTable("_ChapterToGroup").renameTo("chapterGroups").execute()

  await db.schema.alterTable("chapterGroups").renameColumn("A", "chapterId").execute()

  await db.schema.alterTable("chapterGroups").renameColumn("B", "groupId").execute()

  await db.schema
    .alterTable("chapterGroups")
    .renameConstraint("_ChapterToGroup_AB_pkey", "chapterGroups_pkey")
    .execute()

  await db.schema
    .alterTable("chapterGroups")
    .renameConstraint("_ChapterToGroup_A_fkey", "chapterGroups_chapterId_fkey")
    .execute()

  await db.schema
    .alterTable("chapterGroups")
    .renameConstraint("_ChapterToGroup_B_fkey", "chapterGroups_groupId_fkey")
    .execute()

  await sql`ALTER INDEX "_ChapterToGroup_B_index" RENAME TO "chapterGroups_groupId_index"`.execute(
    db,
  )

  // StaffOnMedia
  await db.schema.alterTable("StaffOnMedia").renameTo("mediaStaffs").execute()

  await db.schema
    .alterTable("mediaStaffs")
    .renameConstraint("StaffOnMedia_pkey", "mediaStaffs_pkey")
    .execute()

  await db.schema
    .alterTable("mediaStaffs")
    .renameConstraint("StaffOnMedia_mediaId_fkey", "mediaStaffs_mediaId_fkey")
    .execute()

  await db.schema
    .alterTable("mediaStaffs")
    .renameConstraint("StaffOnMedia_staffId_fkey", "mediaStaffs_staffId_fkey")
    .execute()

  await sql`ALTER INDEX "StaffOnMedia_staffId_index" RENAME TO "mediaStaffs_staffId_index"`.execute(
    db,
  )

  // Task
  await db.schema.alterTable("Task").renameTo("tasks").execute()

  await db.schema.alterTable("tasks").renameConstraint("Task_pkey", "tasks_pkey").execute()

  await installUpdatedAt("tasks")

  // _prisma_migrations
  await db.schema.dropTable("_prisma_migrations").ifExists().execute()
}

export async function down(): Promise<void> {
  throw new Error("rename-tables is a destructive data-type migration and cannot be reversed")
}
