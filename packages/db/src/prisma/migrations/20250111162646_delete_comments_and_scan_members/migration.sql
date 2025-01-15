/*
  Warnings:

  - You are about to drop the `MediaChapterComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScanMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ScanToScanMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MediaChapterComment" DROP CONSTRAINT "MediaChapterComment_mediaChapterId_fkey";

-- DropForeignKey
ALTER TABLE "MediaChapterComment" DROP CONSTRAINT "MediaChapterComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "MediaChapterComment" DROP CONSTRAINT "MediaChapterComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScanMember" DROP CONSTRAINT "ScanMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ScanToScanMember" DROP CONSTRAINT "_ScanToScanMember_A_fkey";

-- DropForeignKey
ALTER TABLE "_ScanToScanMember" DROP CONSTRAINT "_ScanToScanMember_B_fkey";

-- DropIndex
DROP INDEX "User_id_idx";

-- DropTable
DROP TABLE "MediaChapterComment";

-- DropTable
DROP TABLE "ScanMember";

-- DropTable
DROP TABLE "_ScanToScanMember";
