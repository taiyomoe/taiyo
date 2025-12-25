-- AlterColumn: Set default value for tags column (empty array)
ALTER TABLE "Media" ALTER COLUMN "tags" SET DEFAULT '{}';
