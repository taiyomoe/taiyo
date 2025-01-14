-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified", ADD COLUMN "emailVerified" BOOLEAN DEFAULT FALSE;
