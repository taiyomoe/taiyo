/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Session` table. All the data in the column will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "VerificationToken_identifier_token_key";

-- DropIndex
DROP INDEX "VerificationToken_token_key";

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token");

-- AlterTable
ALTER TABLE "UserSetting" RENAME COLUMN "preferredTitleLanguage" TO "preferredTitles";

-- AlterTable
ALTER TABLE "UserSetting" ALTER COLUMN "preferredTitles" SET DEFAULT 'ja_ro';

-- Update
UPDATE "UserSetting" SET "preferredTitles" = 'ja_ro' WHERE "preferredTitles" IS NULL;

-- AlterTable
ALTER TABLE "UserSetting" ALTER COLUMN "preferredTitles" SET NOT NULL;
