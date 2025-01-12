-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSetting" DROP CONSTRAINT "UserSetting_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserHistory" DROP CONSTRAINT "UserHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserLibrary" DROP CONSTRAINT "UserLibrary_userId_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollow" DROP CONSTRAINT "_UserFollow_A_fkey", DROP CONSTRAINT "_UserFollow_B_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "MediaCover" DROP CONSTRAINT "MediaCover_uploaderId_fkey";

-- DropForeignKey
ALTER TABLE "MediaBanner" DROP CONSTRAINT "MediaBanner_uploaderId_fkey";

-- DropForeignKey
ALTER TABLE "MediaChapter" DROP CONSTRAINT "MediaChapter_uploaderId_fkey";

-- DropForeignKey
ALTER TABLE "MediaTitle" DROP CONSTRAINT "MediaTitle_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "MediaTracker" DROP CONSTRAINT "MediaTracker_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_creatorId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey";
ALTER TABLE "Account" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "Account" RENAME COLUMN "userId" TO "userIdTemp";
ALTER TABLE "Account" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Account" ADD COLUMN "userId" UUID;
UPDATE "Account" SET "id" = "idTemp"::UUID, "userId" = "userIdTemp"::UUID;
ALTER TABLE "Account" DROP COLUMN "idTemp";
ALTER TABLE "Account" DROP COLUMN "userIdTemp";
ALTER TABLE "Account" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Account" ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Session" RENAME COLUMN "userId" TO "userIdTemp";
ALTER TABLE "Session" ADD COLUMN "userId" UUID;
UPDATE "Session" SET "userId" = "userIdTemp"::UUID;
ALTER TABLE "Session" DROP COLUMN "userIdTemp";
ALTER TABLE "Session" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserSetting" DROP CONSTRAINT "UserSetting_pkey";
ALTER TABLE "UserSetting" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "UserSetting" RENAME COLUMN "userId" TO "userIdTemp";
ALTER TABLE "UserSetting" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "UserSetting" ADD COLUMN "userId" UUID;
UPDATE "UserSetting" SET "id" = "idTemp"::UUID, "userId" = "userIdTemp"::UUID;
ALTER TABLE "UserSetting" DROP COLUMN "idTemp";
ALTER TABLE "UserSetting" DROP COLUMN "userIdTemp";
ALTER TABLE "UserSetting" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_pkey";
ALTER TABLE "UserProfile" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "UserProfile" RENAME COLUMN "userId" TO "userIdTemp";
ALTER TABLE "UserProfile" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "UserProfile" ADD COLUMN "userId" UUID;
UPDATE "UserProfile" SET "id" = "idTemp"::UUID, "userId" = "userIdTemp"::UUID;
ALTER TABLE "UserProfile" DROP COLUMN "idTemp";
ALTER TABLE "UserProfile" DROP COLUMN "userIdTemp";
ALTER TABLE "UserProfile" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserHistory" RENAME COLUMN "userId" TO "userIdTemp";
ALTER TABLE "UserHistory" ADD COLUMN "userId" UUID;
UPDATE "UserHistory" SET "userId" = "userIdTemp"::UUID;
ALTER TABLE "UserHistory" DROP COLUMN "userIdTemp";
ALTER TABLE "UserHistory" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserLibrary" RENAME COLUMN "userId" TO "userIdTemp";
ALTER TABLE "UserLibrary" ADD COLUMN "userId" UUID;
UPDATE "UserLibrary" SET "userId" = "userIdTemp"::UUID;
ALTER TABLE "UserLibrary" DROP COLUMN "userIdTemp";
ALTER TABLE "UserLibrary" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "_UserFollow" DROP CONSTRAINT "_UserFollow_AB_pkey";
ALTER TABLE "_UserFollow" RENAME COLUMN "A" TO "ATemp";
ALTER TABLE "_UserFollow" RENAME COLUMN "B" TO "BTemp";
ALTER TABLE "_UserFollow" ADD COLUMN "A" UUID;
ALTER TABLE "_UserFollow" ADD COLUMN "B" UUID;
UPDATE "_UserFollow" SET "A" = "ATemp"::UUID, "B" = "BTemp"::UUID;
ALTER TABLE "_UserFollow" DROP COLUMN "ATemp";
ALTER TABLE "_UserFollow" DROP COLUMN "BTemp";
ALTER TABLE "_UserFollow" ALTER COLUMN "A" SET NOT NULL;
ALTER TABLE "_UserFollow" ALTER COLUMN "B" SET NOT NULL;
ALTER TABLE "_UserFollow" ADD CONSTRAINT "_UserFollow_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "Media" RENAME COLUMN "creatorId" TO "creatorIdTemp";
ALTER TABLE "Media" RENAME COLUMN "deleterId" TO "deleterIdTemp";
ALTER TABLE "Media" ADD COLUMN "creatorId" UUID;
ALTER TABLE "Media" ADD COLUMN "deleterId" UUID;
UPDATE "Media" SET "creatorId" = "creatorIdTemp"::UUID, "deleterId" = "deleterIdTemp"::UUID;
ALTER TABLE "Media" DROP COLUMN "creatorIdTemp";
ALTER TABLE "Media" DROP COLUMN "deleterIdTemp";
ALTER TABLE "Media" ALTER COLUMN "creatorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MediaCover" RENAME COLUMN "uploaderId" TO "uploaderIdTemp";
ALTER TABLE "MediaCover" RENAME COLUMN "deleterId" TO "deleterIdTemp";
ALTER TABLE "MediaCover" ADD COLUMN "uploaderId" UUID;
ALTER TABLE "MediaCover" ADD COLUMN "deleterId" UUID;
UPDATE "MediaCover" SET "uploaderId" = "uploaderIdTemp"::UUID, "deleterId" = "deleterIdTemp"::UUID;
ALTER TABLE "MediaCover" DROP COLUMN "uploaderIdTemp";
ALTER TABLE "MediaCover" DROP COLUMN "deleterIdTemp";
ALTER TABLE "MediaCover" ALTER COLUMN "uploaderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MediaBanner" RENAME COLUMN "uploaderId" TO "uploaderIdTemp";
ALTER TABLE "MediaBanner" RENAME COLUMN "deleterId" TO "deleterIdTemp";
ALTER TABLE "MediaBanner" ADD COLUMN "uploaderId" UUID;
ALTER TABLE "MediaBanner" ADD COLUMN "deleterId" UUID;
UPDATE "MediaBanner" SET "uploaderId" = "uploaderIdTemp"::UUID, "deleterId" = "deleterIdTemp"::UUID;
ALTER TABLE "MediaBanner" DROP COLUMN "uploaderIdTemp";
ALTER TABLE "MediaBanner" DROP COLUMN "deleterIdTemp";
ALTER TABLE "MediaBanner" ALTER COLUMN "uploaderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MediaChapter" RENAME COLUMN "uploaderId" TO "uploaderIdTemp";
ALTER TABLE "MediaChapter" RENAME COLUMN "deleterId" TO "deleterIdTemp";
ALTER TABLE "MediaChapter" ADD COLUMN "uploaderId" UUID;
ALTER TABLE "MediaChapter" ADD COLUMN "deleterId" UUID;
UPDATE "MediaChapter" SET "uploaderId" = "uploaderIdTemp"::UUID, "deleterId" = "deleterIdTemp"::UUID;
ALTER TABLE "MediaChapter" DROP COLUMN "uploaderIdTemp";
ALTER TABLE "MediaChapter" DROP COLUMN "deleterIdTemp";
ALTER TABLE "MediaChapter" ALTER COLUMN "uploaderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MediaTitle" RENAME COLUMN "creatorId" TO "creatorIdTemp";
ALTER TABLE "MediaTitle" RENAME COLUMN "deleterId" TO "deleterIdTemp";
ALTER TABLE "MediaTitle" ADD COLUMN "creatorId" UUID;
ALTER TABLE "MediaTitle" ADD COLUMN "deleterId" UUID;
UPDATE "MediaTitle" SET "creatorId" = "creatorIdTemp"::UUID, "deleterId" = "deleterIdTemp"::UUID;
ALTER TABLE "MediaTitle" DROP COLUMN "creatorIdTemp";
ALTER TABLE "MediaTitle" DROP COLUMN "deleterIdTemp";
ALTER TABLE "MediaTitle" ALTER COLUMN "creatorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MediaTracker" RENAME COLUMN "creatorId" TO "creatorIdTemp";
ALTER TABLE "MediaTracker" RENAME COLUMN "deleterId" TO "deleterIdTemp";
ALTER TABLE "MediaTracker" ADD COLUMN "creatorId" UUID;
ALTER TABLE "MediaTracker" ADD COLUMN "deleterId" UUID;
UPDATE "MediaTracker" SET "creatorId" = "creatorIdTemp"::UUID, "deleterId" = "deleterIdTemp"::UUID;
ALTER TABLE "MediaTracker" DROP COLUMN "creatorIdTemp";
ALTER TABLE "MediaTracker" DROP COLUMN "deleterIdTemp";
ALTER TABLE "MediaTracker" ALTER COLUMN "creatorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MediaTitle" RENAME COLUMN "creatorId" TO "creatorIdTemp";
ALTER TABLE "MediaTitle" RENAME COLUMN "deleterId" TO "deleterIdTemp";
ALTER TABLE "MediaTitle" ADD COLUMN "creatorId" UUID;
ALTER TABLE "MediaTitle" ADD COLUMN "deleterId" UUID;
UPDATE "MediaTitle" SET "creatorId" = "creatorIdTemp"::UUID, "deleterId" = "deleterIdTemp"::UUID;
ALTER TABLE "MediaTitle" DROP COLUMN "creatorIdTemp";
ALTER TABLE "MediaTitle" DROP COLUMN "deleterIdTemp";
ALTER TABLE "MediaTitle" ALTER COLUMN "creatorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Scan" RENAME COLUMN "creatorId" TO "creatorIdTemp";
ALTER TABLE "Scan" RENAME COLUMN "deleterId" TO "deleterIdTemp";
ALTER TABLE "Scan" ADD COLUMN "creatorId" UUID;
ALTER TABLE "Scan" ADD COLUMN "deleterId" UUID;
UPDATE "Scan" SET "creatorId" = "creatorIdTemp"::UUID, "deleterId" = "deleterIdTemp"::UUID;
ALTER TABLE "Scan" DROP COLUMN "creatorIdTemp";
ALTER TABLE "Scan" DROP COLUMN "deleterIdTemp";
ALTER TABLE "Scan" ALTER COLUMN "creatorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" RENAME COLUMN "id" TO "idTemp";
ALTER TABLE "User" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
UPDATE "User" SET "id" = "idTemp"::UUID;
ALTER TABLE "User" DROP COLUMN "idTemp";
ALTER TABLE "Scan" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserHistory_mediaId_userId_key" ON "UserHistory"("mediaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLibrary_userId_key" ON "UserLibrary"("userId");

-- CreateIndex
CREATE INDEX "_UserFollow_B_index" ON "_UserFollow"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistory" ADD CONSTRAINT "UserHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLibrary" ADD CONSTRAINT "UserLibrary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollow"
  ADD CONSTRAINT "_UserFollow_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "_UserFollow_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaCover" ADD CONSTRAINT "MediaCover_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaBanner" ADD CONSTRAINT "MediaBanner_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaChapter" ADD CONSTRAINT "MediaChapter_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTitle" ADD CONSTRAINT "MediaTitle_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTracker" ADD CONSTRAINT "MediaTracker_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
