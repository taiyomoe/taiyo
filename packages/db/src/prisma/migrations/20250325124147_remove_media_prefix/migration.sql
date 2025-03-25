-- RenameTable
ALTER TABLE "MediaBanner" RENAME TO "Banner";

-- RenameTable
ALTER TABLE "MediaChapter" RENAME TO "Chapter";

-- RenameTable
ALTER TABLE "MediaCover" RENAME TO "Cover";

-- RenameTable
ALTER TABLE "MediaTitle" RENAME TO "Title";

-- RenameTable
ALTER TABLE "MediaTracker" RENAME TO "Tracker";

-- RenameTable
ALTER TABLE "_MediaChapterToGroup" RENAME TO "_ChapterToGroup";

-- RenamePrimaryKey
ALTER TABLE "Banner" RENAME CONSTRAINT "MediaBanner_pkey" TO "Banner_pkey";

-- RenameForeignKey
ALTER TABLE "Banner" RENAME CONSTRAINT "MediaBanner_mediaId_fkey" TO "Banner_mediaId_fkey";

-- RenameForeignKey
ALTER TABLE "Banner" RENAME CONSTRAINT "MediaBanner_uploaderId_fkey" TO "Banner_uploaderId_fkey";

-- RenamePrimaryKey
ALTER TABLE "Chapter" RENAME CONSTRAINT "MediaChapter_pkey" TO "Chapter_pkey";

-- RenameForeignKey
ALTER TABLE "Chapter" RENAME CONSTRAINT "MediaChapter_mediaId_fkey" TO "Chapter_mediaId_fkey";

-- RenameForeignKey
ALTER TABLE "Chapter" RENAME CONSTRAINT "MediaChapter_uploaderId_fkey" TO "Chapter_uploaderId_fkey";

-- RenamePrimaryKey
ALTER TABLE "Cover" RENAME CONSTRAINT "MediaCover_pkey" TO "Cover_pkey";

-- RenameForeignKey
ALTER TABLE "Cover" RENAME CONSTRAINT "MediaCover_mediaId_fkey" TO "Cover_mediaId_fkey";

-- RenameForeignKey
ALTER TABLE "Cover" RENAME CONSTRAINT "MediaCover_uploaderId_fkey" TO "Cover_uploaderId_fkey";

-- RenamePrimaryKey
ALTER TABLE "Title" RENAME CONSTRAINT "MediaTitle_pkey" TO "Title_pkey";

-- RenameIndex
ALTER INDEX "MediaTitle_mediaId_language_priority_key" RENAME TO "Title_mediaId_language_priority_key";

-- RenameForeignKey
ALTER TABLE "Title" RENAME CONSTRAINT "MediaTitle_mediaId_fkey" TO "Title_mediaId_fkey";

-- RenameForeignKey
ALTER TABLE "Title" RENAME CONSTRAINT "MediaTitle_creatorId_fkey" TO "Title_creatorId_fkey";

-- RenamePrimaryKey
ALTER TABLE "Tracker" RENAME CONSTRAINT "MediaTracker_pkey" TO "Tracker_pkey";

-- RenameForeignKey
ALTER TABLE "Tracker" RENAME CONSTRAINT "MediaTracker_mediaId_fkey" TO "Tracker_mediaId_fkey";

-- RenameForeignKey
ALTER TABLE "Tracker" RENAME CONSTRAINT "MediaTracker_creatorId_fkey" TO "Tracker_creatorId_fkey";

-- RenamePrimaryKey
ALTER TABLE "_ChapterToGroup" RENAME CONSTRAINT "_MediaChapterToGroup_AB_pkey" TO "_ChapterToGroup_AB_pkey";

-- RenameIndex
ALTER INDEX "_MediaChapterToGroup_B_index" RENAME TO "_ChapterToGroup_B_index";

-- RenameForeignKey
ALTER TABLE "_ChapterToGroup" RENAME CONSTRAINT "_MediaChapterToGroup_A_fkey" TO "_ChapterToGroup_A_fkey";

-- RenameForeignKey
ALTER TABLE "_ChapterToGroup" RENAME CONSTRAINT "_MediaChapterToGroup_B_fkey" TO "_ChapterToGroup_B_fkey";

-- RenamePrimaryKey
ALTER TABLE "Group" RENAME CONSTRAINT "Scan_pkey" TO "Group_pkey";
