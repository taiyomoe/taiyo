-- AlterColumn Media.synopsis from TEXT to JSONB with pt-br as default language
ALTER TABLE "Media"
ALTER COLUMN "synopsis" TYPE JSONB
USING CASE WHEN "synopsis" IS NOT NULL THEN jsonb_build_object('pt-br', "synopsis") ELSE '{}' END;

ALTER TABLE "Media"
ALTER COLUMN "synopsis" SET DEFAULT '{}';

ALTER TABLE "Media"
ALTER COLUMN "synopsis" SET NOT NULL;

-- AlterColumn Staff.bio from TEXT to JSONB with en as default language
ALTER TABLE "Staff"
ALTER COLUMN "bio" TYPE JSONB
USING CASE WHEN "bio" IS NOT NULL THEN jsonb_build_object('en', "bio") ELSE '{}' END;

ALTER TABLE "Staff"
ALTER COLUMN "bio" SET DEFAULT '{}';

ALTER TABLE "Staff"
ALTER COLUMN "bio" SET NOT NULL;

-- AlterColumn UserProfile.about from TEXT to JSONB with pt-br as default language
ALTER TABLE "UserProfile"
ALTER COLUMN "about" TYPE JSONB
USING CASE WHEN "about" IS NOT NULL THEN jsonb_build_object('pt-br', "about") ELSE '{}' END;

ALTER TABLE "UserProfile"
ALTER COLUMN "about" SET DEFAULT '{}';

ALTER TABLE "UserProfile"
ALTER COLUMN "about" SET NOT NULL;
