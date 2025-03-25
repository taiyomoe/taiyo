/*
  Warnings:

  - A unique constraint covering the columns `[normalizedEmail]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `emailVerified` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "normalizedEmail" TEXT,
ALTER COLUMN "emailVerified" SET NOT NULL,
ALTER COLUMN "emailVerified" DROP DEFAULT;
