-- AlterTable
ALTER TABLE "_MediaChapterToScan" ADD CONSTRAINT "_MediaChapterToScan_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MediaChapterToScan_AB_unique";

-- AlterTable
ALTER TABLE "_ScanToScanMember" ADD CONSTRAINT "_ScanToScanMember_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ScanToScanMember_AB_unique";

-- AlterTable
ALTER TABLE "_UserFollow" ADD CONSTRAINT "_UserFollow_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserFollow_AB_unique";
