import { type Kysely, sql } from "kysely"

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // --- _chapterToGroups -> chapterGroups (A,B -> chapterId,groupId)
  await sql`ALTER TABLE "_chapterToGroups" RENAME TO "chapterGroups"`.execute(db)
  await sql`ALTER TABLE "chapterGroups" RENAME COLUMN "A" TO "chapterId"`.execute(db)
  await sql`ALTER TABLE "chapterGroups" RENAME COLUMN "B" TO "groupId"`.execute(db)
  await sql`ALTER INDEX "_chapterToGroups_AB_pkey" RENAME TO "chapterGroups_pkey"`.execute(db)
  await sql`ALTER INDEX "_chapterToGroups_B_index" RENAME TO "chapterGroups_groupId_index"`.execute(
    db,
  )
  await sql`ALTER TABLE "chapterGroups" RENAME CONSTRAINT "_chapterToGroups_A_fkey" TO "chapterGroups_chapterId_fkey"`.execute(
    db,
  )
  await sql`ALTER TABLE "chapterGroups" RENAME CONSTRAINT "_chapterToGroups_B_fkey" TO "chapterGroups_groupId_fkey"`.execute(
    db,
  )

  // --- _userFollows -> userFollows (A,B -> followerId,followingId)
  await sql`ALTER TABLE "_userFollows" RENAME TO "userFollows"`.execute(db)
  await sql`ALTER TABLE "userFollows" RENAME COLUMN "A" TO "followerId"`.execute(db)
  await sql`ALTER TABLE "userFollows" RENAME COLUMN "B" TO "followingId"`.execute(db)
  await sql`ALTER INDEX "_userFollows_AB_pkey" RENAME TO "userFollows_pkey"`.execute(db)
  await sql`ALTER INDEX "_userFollows_B_index" RENAME TO "userFollows_followingId_index"`.execute(
    db,
  )
  await sql`ALTER TABLE "userFollows" RENAME CONSTRAINT "_userFollows_A_fkey" TO "userFollows_followerId_fkey"`.execute(
    db,
  )
  await sql`ALTER TABLE "userFollows" RENAME CONSTRAINT "_userFollows_B_fkey" TO "userFollows_followingId_fkey"`.execute(
    db,
  )

  // --- staffOnMedias -> mediaStaffs
  await sql`ALTER TABLE "staffOnMedias" RENAME TO "mediaStaffs"`.execute(db)
  await sql`ALTER INDEX "staffOnMedias_pkey" RENAME TO "mediaStaffs_pkey"`.execute(db)
  await sql`ALTER INDEX "staffOnMedias_staffId_index" RENAME TO "mediaStaffs_staffId_index"`.execute(
    db,
  )
  await sql`ALTER TABLE "mediaStaffs" RENAME CONSTRAINT "staffOnMedias_mediaId_fkey" TO "mediaStaffs_mediaId_fkey"`.execute(
    db,
  )
  await sql`ALTER TABLE "mediaStaffs" RENAME CONSTRAINT "staffOnMedias_staffId_fkey" TO "mediaStaffs_staffId_fkey"`.execute(
    db,
  )
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // --- mediaStaffs -> staffOnMedias
  await sql`ALTER TABLE "mediaStaffs" RENAME CONSTRAINT "mediaStaffs_staffId_fkey" TO "staffOnMedias_staffId_fkey"`.execute(
    db,
  )
  await sql`ALTER TABLE "mediaStaffs" RENAME CONSTRAINT "mediaStaffs_mediaId_fkey" TO "staffOnMedias_mediaId_fkey"`.execute(
    db,
  )
  await sql`ALTER INDEX "mediaStaffs_staffId_index" RENAME TO "staffOnMedias_staffId_index"`.execute(
    db,
  )
  await sql`ALTER INDEX "mediaStaffs_pkey" RENAME TO "staffOnMedias_pkey"`.execute(db)
  await sql`ALTER TABLE "mediaStaffs" RENAME TO "staffOnMedias"`.execute(db)

  // --- userFollows -> _userFollows (followerId,followingId -> A,B)
  await sql`ALTER TABLE "userFollows" RENAME CONSTRAINT "userFollows_followingId_fkey" TO "_userFollows_B_fkey"`.execute(
    db,
  )
  await sql`ALTER TABLE "userFollows" RENAME CONSTRAINT "userFollows_followerId_fkey" TO "_userFollows_A_fkey"`.execute(
    db,
  )
  await sql`ALTER INDEX "userFollows_followingId_index" RENAME TO "_userFollows_B_index"`.execute(
    db,
  )
  await sql`ALTER INDEX "userFollows_pkey" RENAME TO "_userFollows_AB_pkey"`.execute(db)
  await sql`ALTER TABLE "userFollows" RENAME COLUMN "followingId" TO "B"`.execute(db)
  await sql`ALTER TABLE "userFollows" RENAME COLUMN "followerId" TO "A"`.execute(db)
  await sql`ALTER TABLE "userFollows" RENAME TO "_userFollows"`.execute(db)

  // --- chapterGroups -> _chapterToGroups (chapterId,groupId -> A,B)
  await sql`ALTER TABLE "chapterGroups" RENAME CONSTRAINT "chapterGroups_groupId_fkey" TO "_chapterToGroups_B_fkey"`.execute(
    db,
  )
  await sql`ALTER TABLE "chapterGroups" RENAME CONSTRAINT "chapterGroups_chapterId_fkey" TO "_chapterToGroups_A_fkey"`.execute(
    db,
  )
  await sql`ALTER INDEX "chapterGroups_groupId_index" RENAME TO "_chapterToGroups_B_index"`.execute(
    db,
  )
  await sql`ALTER INDEX "chapterGroups_pkey" RENAME TO "_chapterToGroups_AB_pkey"`.execute(db)
  await sql`ALTER TABLE "chapterGroups" RENAME COLUMN "groupId" TO "B"`.execute(db)
  await sql`ALTER TABLE "chapterGroups" RENAME COLUMN "chapterId" TO "A"`.execute(db)
  await sql`ALTER TABLE "chapterGroups" RENAME TO "_chapterToGroups"`.execute(db)
}
