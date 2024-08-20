/*
  Warnings:

  - You are about to drop the column `points` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `about` on the `UserSetting` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `UserSetting` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `UserSetting` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `UserSetting` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `UserSetting` table. All the data in the column will be lost.

*/

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "banner" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" "Genders" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "city" TEXT,
    "country" TEXT,
    "about" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserFollow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserFollow_AB_unique" ON "_UserFollow"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFollow_B_index" ON "_UserFollow"("B");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollow" ADD CONSTRAINT "_UserFollow_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollow" ADD CONSTRAINT "_UserFollow_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MigrateData
INSERT INTO "UserProfile" ("id", "updatedAt", "banner", "birthDate", "gender", "city", "country", "about", "points", "userId")
SELECT
    gen_random_uuid(),
    now(),
    NULL,
    "us"."birthDate",
    "us"."gender",
    "us"."city",
    "us"."country",
    "us"."about",
    "u"."points",
    "us"."userId"
FROM 
    "UserSetting" "us"
JOIN 
    "User" "u" ON "us"."userId" = "u"."id";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "points";

-- AlterTable
ALTER TABLE "UserSetting"
DROP COLUMN "about",
DROP COLUMN "birthDate",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "gender",
ADD COLUMN "showFollowing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "showLibrary" BOOLEAN NOT NULL DEFAULT true;
