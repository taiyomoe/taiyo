-- AlterColumn: Convert Cover.volume from INT to TEXT
ALTER TABLE "Cover"
ALTER COLUMN "volume" TYPE TEXT
USING "volume"::TEXT;

