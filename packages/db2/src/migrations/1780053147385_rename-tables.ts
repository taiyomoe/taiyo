import { type Kysely, sql } from "kysely"

// biome-ignore lint/suspicious/noExplicitAny: migrations are frozen in time
export async function up(db: Kysely<any>): Promise<void> {
  // --- users (was User)
  await sql`ALTER TABLE "User" RENAME TO "users"`.execute(db)
  await sql`ALTER INDEX "User_pkey" RENAME TO "users_pkey"`.execute(db)
  await sql`ALTER INDEX "User_email_key" RENAME TO "users_email_key"`.execute(db)
  await sql`ALTER INDEX "User_username_key" RENAME TO "users_username_key"`.execute(db)
  await sql`ALTER INDEX "User_displayUsername_key" RENAME TO "users_displayUsername_key"`.execute(db)

  // --- userProfiles (was UserProfile)
  await sql`ALTER TABLE "UserProfile" RENAME TO "userProfiles"`.execute(db)
  await sql`ALTER INDEX "UserProfile_pkey" RENAME TO "userProfiles_pkey"`.execute(db)
  await sql`ALTER INDEX "UserProfile_userId_key" RENAME TO "userProfiles_userId_key"`.execute(db)
  await sql`ALTER TABLE "userProfiles" RENAME CONSTRAINT "UserProfile_userId_fkey" TO "userProfiles_userId_fkey"`.execute(db)

  // --- userLibraries (was UserLibrary)
  await sql`ALTER TABLE "UserLibrary" RENAME TO "userLibraries"`.execute(db)
  await sql`ALTER INDEX "UserLibrary_userId_key" RENAME TO "userLibraries_userId_key"`.execute(db)
  await sql`ALTER TABLE "userLibraries" RENAME CONSTRAINT "UserLibrary_userId_fkey" TO "userLibraries_userId_fkey"`.execute(db)

  // --- _userFollows (was _UserFollow)
  await sql`ALTER TABLE "_UserFollow" RENAME TO "_userFollows"`.execute(db)
  await sql`ALTER INDEX "_UserFollow_AB_pkey" RENAME TO "_userFollows_AB_pkey"`.execute(db)
  await sql`ALTER INDEX "_UserFollow_B_index" RENAME TO "_userFollows_B_index"`.execute(db)
  await sql`ALTER TABLE "_userFollows" RENAME CONSTRAINT "_UserFollow_A_fkey" TO "_userFollows_A_fkey"`.execute(db)
  await sql`ALTER TABLE "_userFollows" RENAME CONSTRAINT "_UserFollow_B_fkey" TO "_userFollows_B_fkey"`.execute(db)

  // --- accounts (was Account)
  await sql`ALTER TABLE "Account" RENAME TO "accounts"`.execute(db)
  await sql`ALTER INDEX "Account_pkey" RENAME TO "accounts_pkey"`.execute(db)
  await sql`ALTER INDEX "Account_accountId_providerId_userId_key" RENAME TO "accounts_accountId_providerId_userId_key"`.execute(db)
  await sql`ALTER TABLE "accounts" RENAME CONSTRAINT "Account_userId_fkey" TO "accounts_userId_fkey"`.execute(db)

  // --- sessions (was Session)
  await sql`ALTER TABLE "Session" RENAME TO "sessions"`.execute(db)
  await sql`ALTER INDEX "Session_pkey" RENAME TO "sessions_pkey"`.execute(db)
  await sql`ALTER INDEX "Session_token_key" RENAME TO "sessions_token_key"`.execute(db)
  await sql`ALTER TABLE "sessions" RENAME CONSTRAINT "Session_userId_fkey" TO "sessions_userId_fkey"`.execute(db)

  // --- verifications (was Verification)
  await sql`ALTER TABLE "Verification" RENAME TO "verifications"`.execute(db)
  await sql`ALTER INDEX "Verification_pkey" RENAME TO "verifications_pkey"`.execute(db)

  // --- groups (was Group)
  await sql`ALTER TABLE "Group" RENAME TO "groups"`.execute(db)
  await sql`ALTER INDEX "Group_pkey" RENAME TO "groups_pkey"`.execute(db)
  await sql`ALTER TABLE "groups" RENAME CONSTRAINT "Group_creatorId_fkey" TO "groups_creatorId_fkey"`.execute(db)

  // --- staffs (was Staff)
  await sql`ALTER TABLE "Staff" RENAME TO "staffs"`.execute(db)
  await sql`ALTER INDEX "Staff_pkey" RENAME TO "staffs_pkey"`.execute(db)
  await sql`ALTER TABLE "staffs" RENAME CONSTRAINT "Staff_creatorId_fkey" TO "staffs_creatorId_fkey"`.execute(db)

  // --- medias (was Media)
  await sql`ALTER TABLE "Media" RENAME TO "medias"`.execute(db)
  await sql`ALTER INDEX "Media_pkey" RENAME TO "medias_pkey"`.execute(db)
  await sql`ALTER TABLE "medias" RENAME CONSTRAINT "Media_creatorId_fkey" TO "medias_creatorId_fkey"`.execute(db)

  // --- userHistories (was UserHistory)
  await sql`ALTER TABLE "UserHistory" RENAME TO "userHistories"`.execute(db)
  await sql`ALTER INDEX "UserHistory_mediaId_userId_key" RENAME TO "userHistories_mediaId_userId_key"`.execute(db)
  await sql`ALTER TABLE "userHistories" RENAME CONSTRAINT "UserHistory_mediaId_fkey" TO "userHistories_mediaId_fkey"`.execute(db)
  await sql`ALTER TABLE "userHistories" RENAME CONSTRAINT "UserHistory_userId_fkey" TO "userHistories_userId_fkey"`.execute(db)

  // --- banners (was Banner)
  await sql`ALTER TABLE "Banner" RENAME TO "banners"`.execute(db)
  await sql`ALTER INDEX "Banner_pkey" RENAME TO "banners_pkey"`.execute(db)
  await sql`ALTER TABLE "banners" RENAME CONSTRAINT "Banner_mediaId_fkey" TO "banners_mediaId_fkey"`.execute(db)
  await sql`ALTER TABLE "banners" RENAME CONSTRAINT "Banner_uploaderId_fkey" TO "banners_uploaderId_fkey"`.execute(db)

  // --- covers (was Cover)
  await sql`ALTER TABLE "Cover" RENAME TO "covers"`.execute(db)
  await sql`ALTER INDEX "Cover_pkey" RENAME TO "covers_pkey"`.execute(db)
  await sql`ALTER TABLE "covers" RENAME CONSTRAINT "Cover_mediaId_fkey" TO "covers_mediaId_fkey"`.execute(db)
  await sql`ALTER TABLE "covers" RENAME CONSTRAINT "Cover_uploaderId_fkey" TO "covers_uploaderId_fkey"`.execute(db)

  // --- titles (was Title)
  await sql`ALTER TABLE "Title" RENAME TO "titles"`.execute(db)
  await sql`ALTER INDEX "Title_pkey" RENAME TO "titles_pkey"`.execute(db)
  await sql`ALTER INDEX "Title_mediaId_language_priority_key" RENAME TO "titles_mediaId_language_priority_key"`.execute(db)
  await sql`ALTER TABLE "titles" RENAME CONSTRAINT "Title_creatorId_fkey" TO "titles_creatorId_fkey"`.execute(db)
  await sql`ALTER TABLE "titles" RENAME CONSTRAINT "Title_mediaId_fkey" TO "titles_mediaId_fkey"`.execute(db)

  // --- chapters (was Chapter)
  await sql`ALTER TABLE "Chapter" RENAME TO "chapters"`.execute(db)
  await sql`ALTER INDEX "Chapter_pkey" RENAME TO "chapters_pkey"`.execute(db)
  await sql`ALTER TABLE "chapters" RENAME CONSTRAINT "Chapter_mediaId_fkey" TO "chapters_mediaId_fkey"`.execute(db)
  await sql`ALTER TABLE "chapters" RENAME CONSTRAINT "Chapter_uploaderId_fkey" TO "chapters_uploaderId_fkey"`.execute(db)

  // --- _chapterToGroups (was _ChapterToGroup)
  await sql`ALTER TABLE "_ChapterToGroup" RENAME TO "_chapterToGroups"`.execute(db)
  await sql`ALTER INDEX "_ChapterToGroup_AB_pkey" RENAME TO "_chapterToGroups_AB_pkey"`.execute(db)
  await sql`ALTER INDEX "_ChapterToGroup_B_index" RENAME TO "_chapterToGroups_B_index"`.execute(db)
  await sql`ALTER TABLE "_chapterToGroups" RENAME CONSTRAINT "_ChapterToGroup_A_fkey" TO "_chapterToGroups_A_fkey"`.execute(db)
  await sql`ALTER TABLE "_chapterToGroups" RENAME CONSTRAINT "_ChapterToGroup_B_fkey" TO "_chapterToGroups_B_fkey"`.execute(db)

  // --- staffOnMedias (was StaffOnMedia)
  await sql`ALTER TABLE "StaffOnMedia" RENAME TO "staffOnMedias"`.execute(db)
  await sql`ALTER INDEX "StaffOnMedia_pkey" RENAME TO "staffOnMedias_pkey"`.execute(db)
  await sql`ALTER INDEX "StaffOnMedia_staffId_index" RENAME TO "staffOnMedias_staffId_index"`.execute(db)
  await sql`ALTER TABLE "staffOnMedias" RENAME CONSTRAINT "StaffOnMedia_mediaId_fkey" TO "staffOnMedias_mediaId_fkey"`.execute(db)
  await sql`ALTER TABLE "staffOnMedias" RENAME CONSTRAINT "StaffOnMedia_staffId_fkey" TO "staffOnMedias_staffId_fkey"`.execute(db)

  // --- tasks (was Task)
  await sql`ALTER TABLE "Task" RENAME TO "tasks"`.execute(db)
  await sql`ALTER INDEX "Task_pkey" RENAME TO "tasks_pkey"`.execute(db)

  // --- drop the legacy Prisma migrations table if present (no-op on fresh DBs)
  await db.schema.dropTable("_prisma_migrations").ifExists().execute()
}

// biome-ignore lint/suspicious/noExplicitAny: migrations are frozen in time
export async function down(db: Kysely<any>): Promise<void> {
  // --- recreate the legacy Prisma migrations table
  await db.schema
    .createTable("_prisma_migrations")
    .addColumn("id", sql`varchar`, (c) => c.primaryKey())
    .addColumn("checksum", sql`varchar`, (c) => c.notNull())
    .addColumn("finished_at", sql`timestamptz`)
    .addColumn("migration_name", sql`varchar`, (c) => c.notNull())
    .addColumn("logs", "text")
    .addColumn("rolled_back_at", sql`timestamptz`)
    .addColumn("started_at", sql`timestamptz`, (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn("applied_steps_count", "integer", (c) =>
      c.notNull().defaultTo(0),
    )
    .execute()

  // --- tasks -> Task
  await sql`ALTER INDEX "tasks_pkey" RENAME TO "Task_pkey"`.execute(db)
  await sql`ALTER TABLE "tasks" RENAME TO "Task"`.execute(db)

  // --- staffOnMedias -> StaffOnMedia
  await sql`ALTER TABLE "staffOnMedias" RENAME CONSTRAINT "staffOnMedias_staffId_fkey" TO "StaffOnMedia_staffId_fkey"`.execute(db)
  await sql`ALTER TABLE "staffOnMedias" RENAME CONSTRAINT "staffOnMedias_mediaId_fkey" TO "StaffOnMedia_mediaId_fkey"`.execute(db)
  await sql`ALTER INDEX "staffOnMedias_staffId_index" RENAME TO "StaffOnMedia_staffId_index"`.execute(db)
  await sql`ALTER INDEX "staffOnMedias_pkey" RENAME TO "StaffOnMedia_pkey"`.execute(db)
  await sql`ALTER TABLE "staffOnMedias" RENAME TO "StaffOnMedia"`.execute(db)

  // --- _chapterToGroups -> _ChapterToGroup
  await sql`ALTER TABLE "_chapterToGroups" RENAME CONSTRAINT "_chapterToGroups_B_fkey" TO "_ChapterToGroup_B_fkey"`.execute(db)
  await sql`ALTER TABLE "_chapterToGroups" RENAME CONSTRAINT "_chapterToGroups_A_fkey" TO "_ChapterToGroup_A_fkey"`.execute(db)
  await sql`ALTER INDEX "_chapterToGroups_B_index" RENAME TO "_ChapterToGroup_B_index"`.execute(db)
  await sql`ALTER INDEX "_chapterToGroups_AB_pkey" RENAME TO "_ChapterToGroup_AB_pkey"`.execute(db)
  await sql`ALTER TABLE "_chapterToGroups" RENAME TO "_ChapterToGroup"`.execute(db)

  // --- chapters -> Chapter
  await sql`ALTER TABLE "chapters" RENAME CONSTRAINT "chapters_uploaderId_fkey" TO "Chapter_uploaderId_fkey"`.execute(db)
  await sql`ALTER TABLE "chapters" RENAME CONSTRAINT "chapters_mediaId_fkey" TO "Chapter_mediaId_fkey"`.execute(db)
  await sql`ALTER INDEX "chapters_pkey" RENAME TO "Chapter_pkey"`.execute(db)
  await sql`ALTER TABLE "chapters" RENAME TO "Chapter"`.execute(db)

  // --- titles -> Title
  await sql`ALTER TABLE "titles" RENAME CONSTRAINT "titles_mediaId_fkey" TO "Title_mediaId_fkey"`.execute(db)
  await sql`ALTER TABLE "titles" RENAME CONSTRAINT "titles_creatorId_fkey" TO "Title_creatorId_fkey"`.execute(db)
  await sql`ALTER INDEX "titles_mediaId_language_priority_key" RENAME TO "Title_mediaId_language_priority_key"`.execute(db)
  await sql`ALTER INDEX "titles_pkey" RENAME TO "Title_pkey"`.execute(db)
  await sql`ALTER TABLE "titles" RENAME TO "Title"`.execute(db)

  // --- covers -> Cover
  await sql`ALTER TABLE "covers" RENAME CONSTRAINT "covers_uploaderId_fkey" TO "Cover_uploaderId_fkey"`.execute(db)
  await sql`ALTER TABLE "covers" RENAME CONSTRAINT "covers_mediaId_fkey" TO "Cover_mediaId_fkey"`.execute(db)
  await sql`ALTER INDEX "covers_pkey" RENAME TO "Cover_pkey"`.execute(db)
  await sql`ALTER TABLE "covers" RENAME TO "Cover"`.execute(db)

  // --- banners -> Banner
  await sql`ALTER TABLE "banners" RENAME CONSTRAINT "banners_uploaderId_fkey" TO "Banner_uploaderId_fkey"`.execute(db)
  await sql`ALTER TABLE "banners" RENAME CONSTRAINT "banners_mediaId_fkey" TO "Banner_mediaId_fkey"`.execute(db)
  await sql`ALTER INDEX "banners_pkey" RENAME TO "Banner_pkey"`.execute(db)
  await sql`ALTER TABLE "banners" RENAME TO "Banner"`.execute(db)

  // --- userHistories -> UserHistory
  await sql`ALTER TABLE "userHistories" RENAME CONSTRAINT "userHistories_userId_fkey" TO "UserHistory_userId_fkey"`.execute(db)
  await sql`ALTER TABLE "userHistories" RENAME CONSTRAINT "userHistories_mediaId_fkey" TO "UserHistory_mediaId_fkey"`.execute(db)
  await sql`ALTER INDEX "userHistories_mediaId_userId_key" RENAME TO "UserHistory_mediaId_userId_key"`.execute(db)
  await sql`ALTER TABLE "userHistories" RENAME TO "UserHistory"`.execute(db)

  // --- medias -> Media
  await sql`ALTER TABLE "medias" RENAME CONSTRAINT "medias_creatorId_fkey" TO "Media_creatorId_fkey"`.execute(db)
  await sql`ALTER INDEX "medias_pkey" RENAME TO "Media_pkey"`.execute(db)
  await sql`ALTER TABLE "medias" RENAME TO "Media"`.execute(db)

  // --- staffs -> Staff
  await sql`ALTER TABLE "staffs" RENAME CONSTRAINT "staffs_creatorId_fkey" TO "Staff_creatorId_fkey"`.execute(db)
  await sql`ALTER INDEX "staffs_pkey" RENAME TO "Staff_pkey"`.execute(db)
  await sql`ALTER TABLE "staffs" RENAME TO "Staff"`.execute(db)

  // --- groups -> Group
  await sql`ALTER TABLE "groups" RENAME CONSTRAINT "groups_creatorId_fkey" TO "Group_creatorId_fkey"`.execute(db)
  await sql`ALTER INDEX "groups_pkey" RENAME TO "Group_pkey"`.execute(db)
  await sql`ALTER TABLE "groups" RENAME TO "Group"`.execute(db)

  // --- verifications -> Verification
  await sql`ALTER INDEX "verifications_pkey" RENAME TO "Verification_pkey"`.execute(db)
  await sql`ALTER TABLE "verifications" RENAME TO "Verification"`.execute(db)

  // --- sessions -> Session
  await sql`ALTER TABLE "sessions" RENAME CONSTRAINT "sessions_userId_fkey" TO "Session_userId_fkey"`.execute(db)
  await sql`ALTER INDEX "sessions_token_key" RENAME TO "Session_token_key"`.execute(db)
  await sql`ALTER INDEX "sessions_pkey" RENAME TO "Session_pkey"`.execute(db)
  await sql`ALTER TABLE "sessions" RENAME TO "Session"`.execute(db)

  // --- accounts -> Account
  await sql`ALTER TABLE "accounts" RENAME CONSTRAINT "accounts_userId_fkey" TO "Account_userId_fkey"`.execute(db)
  await sql`ALTER INDEX "accounts_accountId_providerId_userId_key" RENAME TO "Account_accountId_providerId_userId_key"`.execute(db)
  await sql`ALTER INDEX "accounts_pkey" RENAME TO "Account_pkey"`.execute(db)
  await sql`ALTER TABLE "accounts" RENAME TO "Account"`.execute(db)

  // --- _userFollows -> _UserFollow
  await sql`ALTER TABLE "_userFollows" RENAME CONSTRAINT "_userFollows_B_fkey" TO "_UserFollow_B_fkey"`.execute(db)
  await sql`ALTER TABLE "_userFollows" RENAME CONSTRAINT "_userFollows_A_fkey" TO "_UserFollow_A_fkey"`.execute(db)
  await sql`ALTER INDEX "_userFollows_B_index" RENAME TO "_UserFollow_B_index"`.execute(db)
  await sql`ALTER INDEX "_userFollows_AB_pkey" RENAME TO "_UserFollow_AB_pkey"`.execute(db)
  await sql`ALTER TABLE "_userFollows" RENAME TO "_UserFollow"`.execute(db)

  // --- userLibraries -> UserLibrary
  await sql`ALTER TABLE "userLibraries" RENAME CONSTRAINT "userLibraries_userId_fkey" TO "UserLibrary_userId_fkey"`.execute(db)
  await sql`ALTER INDEX "userLibraries_userId_key" RENAME TO "UserLibrary_userId_key"`.execute(db)
  await sql`ALTER TABLE "userLibraries" RENAME TO "UserLibrary"`.execute(db)

  // --- userProfiles -> UserProfile
  await sql`ALTER TABLE "userProfiles" RENAME CONSTRAINT "userProfiles_userId_fkey" TO "UserProfile_userId_fkey"`.execute(db)
  await sql`ALTER INDEX "userProfiles_userId_key" RENAME TO "UserProfile_userId_key"`.execute(db)
  await sql`ALTER INDEX "userProfiles_pkey" RENAME TO "UserProfile_pkey"`.execute(db)
  await sql`ALTER TABLE "userProfiles" RENAME TO "UserProfile"`.execute(db)

  // --- users -> User
  await sql`ALTER INDEX "users_displayUsername_key" RENAME TO "User_displayUsername_key"`.execute(db)
  await sql`ALTER INDEX "users_username_key" RENAME TO "User_username_key"`.execute(db)
  await sql`ALTER INDEX "users_email_key" RENAME TO "User_email_key"`.execute(db)
  await sql`ALTER INDEX "users_pkey" RENAME TO "User_pkey"`.execute(db)
  await sql`ALTER TABLE "users" RENAME TO "User"`.execute(db)
}
