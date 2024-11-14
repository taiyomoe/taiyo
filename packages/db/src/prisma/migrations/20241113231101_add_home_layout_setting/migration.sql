-- CreateEnum
CREATE TYPE "HomeLayout" AS ENUM ('ROWS', 'COLUMNS');

-- AlterTable
ALTER TABLE "UserSetting" ADD COLUMN     "homeLayout" "HomeLayout" NOT NULL DEFAULT 'ROWS';
