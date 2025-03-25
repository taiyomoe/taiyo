-- RenameEnum
ALTER TYPE "ScanMemberRoles" RENAME TO "GroupMemberRoles";

-- RenameEnum
ALTER TYPE "ScanMemberPermissions" RENAME TO "GroupMemberPermissions";

-- RenameTable
ALTER TABLE "Scan" RENAME TO "Group";

-- RenameTable
ALTER TABLE "_MediaChapterToScan" RENAME TO "_MediaChapterToGroup";

-- RenameForeignKey
ALTER TABLE "Group" RENAME CONSTRAINT "Scan_creatorId_fkey" TO "Group_creatorId_fkey";

-- RenameForeignKey
ALTER TABLE "_MediaChapterToGroup" RENAME CONSTRAINT "_MediaChapterToScan_A_fkey" TO "_MediaChapterToGroup_A_fkey";

-- RenameForeignKey
ALTER TABLE "_MediaChapterToGroup" RENAME CONSTRAINT "_MediaChapterToScan_B_fkey" TO "_MediaChapterToGroup_B_fkey";

-- RenameIndex
ALTER TABLE "_MediaChapterToGroup" RENAME CONSTRAINT "_MediaChapterToScan_AB_pkey" TO "_MediaChapterToGroup_AB_pkey";

-- CreateIndex
CREATE INDEX "_MediaChapterToGroup_B_index" ON "_MediaChapterToGroup"("B");

-- RenameColumn
ALTER TABLE "Group" RENAME COLUMN "twitter" TO "x";
