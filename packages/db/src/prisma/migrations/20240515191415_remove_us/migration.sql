/*
  Warnings:

  - You are about to drop the `UploadSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UploadSession" DROP CONSTRAINT "UploadSession_userId_fkey";

-- DropTable
DROP TABLE "UploadSession";

-- DropEnum
DROP TYPE "UploadSessionStatus";

-- DropEnum
DROP TYPE "UploadSessionType";
