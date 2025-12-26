-- AlterColumn: Convert Cover.volume from INT to TEXT
ALTER TABLE "Cover"
ALTER COLUMN "volume" TYPE TEXT
USING "volume"::TEXT;

-- AlterColumn: Convert Chapter.volume from INT to TEXT
ALTER TABLE "Chapter"
ALTER COLUMN "volume" TYPE TEXT
USING "volume"::TEXT;
