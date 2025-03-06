-- DropForeignKey
ALTER TABLE "UserHistory" DROP CONSTRAINT "UserHistory_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "MediaCover" DROP CONSTRAINT "MediaCover_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "MediaBanner" DROP CONSTRAINT "MediaBanner_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "MediaChapter" DROP CONSTRAINT "MediaChapter_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "MediaTitle" DROP CONSTRAINT "MediaTitle_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "MediaTracker" DROP CONSTRAINT "MediaTracker_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "_MediaChapterToScan" DROP CONSTRAINT "_MediaChapterToScan_A_fkey", DROP CONSTRAINT "_MediaChapterToScan_B_fkey";

-- AlterTable
ALTER TABLE "UserHistory" RENAME COLUMN "mediaId" TO "mediaIdTemp";
ALTER TABLE "UserHistory" ADD COLUMN "mediaId" UUID;
UPDATE "UserHistory" SET "mediaId" = "mediaIdTemp"::UUID;
ALTER TABLE "UserHistory" DROP COLUMN "mediaIdTemp";
ALTER TABLE "UserHistory" ALTER COLUMN "mediaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MediaCover" DROP CONSTRAINT "MediaCover_pkey";
ALTER TABLE "MediaCover" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "MediaCover" RENAME COLUMN "mediaId" TO "mediaIdTemp";
ALTER TABLE "MediaCover" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "MediaCover" ADD COLUMN "mediaId" UUID;
UPDATE "MediaCover" SET "id" = "idTemp"::UUID, "mediaId" = "mediaIdTemp"::UUID;
ALTER TABLE "MediaCover" DROP COLUMN "idTemp";
ALTER TABLE "MediaCover" DROP COLUMN "mediaIdTemp";
ALTER TABLE "MediaCover" ALTER COLUMN "mediaId" SET NOT NULL;
ALTER TABLE "MediaCover" ADD CONSTRAINT "MediaCover_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MediaBanner" DROP CONSTRAINT "MediaBanner_pkey";
ALTER TABLE "MediaBanner" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "MediaBanner" RENAME COLUMN "mediaId" TO "mediaIdTemp";
ALTER TABLE "MediaBanner" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "MediaBanner" ADD COLUMN "mediaId" UUID;
UPDATE "MediaBanner" SET "id" = "idTemp"::UUID, "mediaId" = "mediaIdTemp"::UUID;
ALTER TABLE "MediaBanner" DROP COLUMN "idTemp";
ALTER TABLE "MediaBanner" DROP COLUMN "mediaIdTemp";
ALTER TABLE "MediaBanner" ALTER COLUMN "mediaId" SET NOT NULL;
ALTER TABLE "MediaBanner" ADD CONSTRAINT "MediaBanner_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MediaChapter" DROP CONSTRAINT "MediaChapter_pkey";
ALTER TABLE "MediaChapter" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "MediaChapter" RENAME COLUMN "mediaId" TO "mediaIdTemp";
ALTER TABLE "MediaChapter" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "MediaChapter" ADD COLUMN "mediaId" UUID;
UPDATE "MediaChapter" SET "id" = "idTemp"::UUID, "mediaId" = "mediaIdTemp"::UUID;
ALTER TABLE "MediaChapter" DROP COLUMN "idTemp";
ALTER TABLE "MediaChapter" DROP COLUMN "mediaIdTemp";
ALTER TABLE "MediaChapter" ALTER COLUMN "mediaId" SET NOT NULL;
ALTER TABLE "MediaChapter" ADD CONSTRAINT "MediaChapter_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MediaTitle" DROP CONSTRAINT "MediaTitle_pkey";
ALTER TABLE "MediaTitle" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "MediaTitle" RENAME COLUMN "mediaId" TO "mediaIdTemp";
ALTER TABLE "MediaTitle" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "MediaTitle" ADD COLUMN "mediaId" UUID;
UPDATE "MediaTitle" SET "id" = "idTemp"::UUID, "mediaId" = "mediaIdTemp"::UUID;
ALTER TABLE "MediaTitle" DROP COLUMN "idTemp";
ALTER TABLE "MediaTitle" DROP COLUMN "mediaIdTemp";
ALTER TABLE "MediaTitle" ALTER COLUMN "mediaId" SET NOT NULL;
ALTER TABLE "MediaTitle" ADD CONSTRAINT "MediaTitle_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MediaTracker" DROP CONSTRAINT "MediaTracker_pkey";
ALTER TABLE "MediaTracker" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "MediaTracker" RENAME COLUMN "mediaId" TO "mediaIdTemp";
ALTER TABLE "MediaTracker" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "MediaTracker" ADD COLUMN "mediaId" UUID;
UPDATE "MediaTracker" SET "id" = "idTemp"::UUID, "mediaId" = "mediaIdTemp"::UUID;
ALTER TABLE "MediaTracker" DROP COLUMN "idTemp";
ALTER TABLE "MediaTracker" DROP COLUMN "mediaIdTemp";
ALTER TABLE "MediaTracker" ALTER COLUMN "mediaId" SET NOT NULL;
ALTER TABLE "MediaTracker" ADD CONSTRAINT "MediaTracker_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_pkey";
ALTER TABLE "Scan" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "Scan" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
UPDATE "Scan" SET "id" = "idTemp"::UUID;
ALTER TABLE "Scan" DROP COLUMN "idTemp";
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Task" DROP CONSTRAINT "Task_pkey";
ALTER TABLE "Task" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "Task" RENAME COLUMN "sessionId" TO "sessionIdTemp";
ALTER TABLE "Task" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Task" ADD COLUMN "sessionId" UUID;
UPDATE "Task" SET "id" = "idTemp"::UUID, "sessionId" = "sessionIdTemp"::UUID;
ALTER TABLE "Task" DROP COLUMN "idTemp";
ALTER TABLE "Task" DROP COLUMN "sessionIdTemp";
ALTER TABLE "Task" ALTER COLUMN "sessionId" SET NOT NULL;
ALTER TABLE "Task" ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_MediaChapterToScan" DROP CONSTRAINT "_MediaChapterToScan_AB_pkey";
ALTER TABLE "_MediaChapterToScan" RENAME COLUMN "A" TO "ATemp";
ALTER TABLE "_MediaChapterToScan" RENAME COLUMN "B" TO "BTemp";
ALTER TABLE "_MediaChapterToScan" ADD COLUMN "A" UUID;
ALTER TABLE "_MediaChapterToScan" ADD COLUMN "B" UUID;
UPDATE "_MediaChapterToScan" SET "A" = "ATemp"::UUID, "B" = "BTemp"::UUID;
ALTER TABLE "_MediaChapterToScan" DROP COLUMN "ATemp";
ALTER TABLE "_MediaChapterToScan" DROP COLUMN "BTemp";
ALTER TABLE "_MediaChapterToScan" ALTER COLUMN "A" SET NOT NULL;
ALTER TABLE "_MediaChapterToScan" ALTER COLUMN "B" SET NOT NULL;
ALTER TABLE "_MediaChapterToScan" ADD CONSTRAINT "_MediaChapterToScan_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "Media" DROP CONSTRAINT "Media_pkey";
ALTER TABLE "Media" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "Media" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
UPDATE "Media" SET "id" = "idTemp"::UUID;
ALTER TABLE "Media" DROP COLUMN "idTemp";
ALTER TABLE "Media" ADD CONSTRAINT "Media_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserHistory_mediaId_userId_key" ON "UserHistory"("mediaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaTitle_mediaId_language_priority_key" ON "MediaTitle"("mediaId", "language", "priority");

-- CreateIndex
CREATE INDEX "_MediaChapterToScan_B_index" ON "_MediaChapterToScan"("B");

-- AddForeignKey
ALTER TABLE "UserHistory" ADD CONSTRAINT "UserHistory_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaCover" ADD CONSTRAINT "MediaCover_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaBanner" ADD CONSTRAINT "MediaBanner_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaChapter" ADD CONSTRAINT "MediaChapter_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTitle" ADD CONSTRAINT "MediaTitle_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTracker" ADD CONSTRAINT "MediaTracker_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaChapterToScan"
  ADD CONSTRAINT "_MediaChapterToScan_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "_MediaChapterToScan_B_fkey" FOREIGN KEY ("B") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
