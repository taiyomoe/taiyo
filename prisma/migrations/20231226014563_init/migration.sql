-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('USER', 'MODERATOR', 'UPLOADER_INTERN', 'UPLOADER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Genders" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "ContentRating" AS ENUM ('NORMAL', 'SUGGESTIVE', 'NSFW', 'NSFL');

-- CreateEnum
CREATE TYPE "Flag" AS ENUM ('OK', 'STAFF_ONLY', 'VIP_ONLY', 'LOCKED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('MANGA', 'MANHWA', 'MANHUA', 'LIGHT_NOVEL', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('RELEASING', 'FINISHED', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS');

-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('ORIGINAL', 'LIGHT_NOVEL', 'VISUAL_NOVEL', 'WEB_NOVEL', 'VIDEO_GAME');

-- CreateEnum
CREATE TYPE "MediaDemography" AS ENUM ('SHOUNEN', 'SHOUJO', 'SEINEN', 'JOSEI');

-- CreateEnum
CREATE TYPE "MediaCountryOfOrigin" AS ENUM ('JAPAN', 'KOREA', 'CHINA', 'USA', 'FRANCE', 'BRAZIL');

-- CreateEnum
CREATE TYPE "MediaGenres" AS ENUM ('ACTION', 'ADVENTURE', 'COMEDY', 'DRAMA', 'ECCHI', 'FANTASY', 'HENTAI', 'HORROR', 'MAHOU_SHOUJO', 'MECHA', 'MUSIC', 'MYSTERY', 'PSYCHOLOGICAL', 'ROMANCE', 'SCI_FI', 'SLICE_OF_LIFE', 'SPORTS', 'SUPERNATURAL', 'THRILLER');

-- CreateEnum
CREATE TYPE "Trackers" AS ENUM ('MANGADEX', 'MYANIMELIST', 'ANILIST');

-- CreateEnum
CREATE TYPE "ScanMemberRoles" AS ENUM ('OWNER', 'ADMIN', 'TRANSLATOR', 'PROOFREADER', 'CLEANER', 'REDRAWER', 'TYPESETTER', 'QUALITY_CHECKER', 'RAW_PROVIDER', 'OTHER');

-- CreateEnum
CREATE TYPE "ScanMemberPermissions" AS ENUM ('UPLOAD', 'EDIT', 'DELETE');

-- CreateEnum
CREATE TYPE "UploadSessionStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'FINISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "UploadSessionType" AS ENUM ('COVER', 'BANNER', 'CHAPTER');

-- CreateEnum
CREATE TYPE "Languages" AS ENUM ('ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae', 'ay', 'az', 'bm', 'ba', 'eu', 'be', 'bn', 'bi', 'bs', 'br', 'bg', 'my', 'ca', 'ch', 'ce', 'ny', 'cu', 'cv', 'kw', 'co', 'cr', 'hr', 'cs', 'da', 'dv', 'nl', 'dz', 'en', 'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fr', 'fy', 'ff', 'gd', 'gl', 'lg', 'ka', 'de', 'el', 'kl', 'gn', 'gu', 'ht', 'ha', 'he', 'hz', 'hi', 'ho', 'hu', 'is', 'io', 'ig', 'id', 'ia', 'ie', 'iu', 'ik', 'ga', 'it', 'jv', 'kn', 'kr', 'ks', 'kk', 'km', 'ki', 'rw', 'ky', 'kv', 'kg', 'kj', 'ku', 'lo', 'la', 'lv', 'li', 'ln', 'lt', 'lu', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'gv', 'mi', 'mr', 'mh', 'mn', 'na', 'nv', 'nd', 'nr', 'ng', 'ne', 'no', 'nb', 'nn', 'ii', 'oc', 'oj', 'or', 'om', 'os', 'pi', 'ps', 'fa', 'pl', 'pa', 'qu', 'ro', 'rm', 'rn', 'ru', 'se', 'sm', 'sg', 'sa', 'sc', 'sr', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'st', 'su', 'sw', 'ss', 'sv', 'tl', 'ty', 'tg', 'ta', 'tt', 'te', 'th', 'bo', 'ti', 'to', 'ts', 'tn', 'tr', 'tk', 'tw', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'wo', 'xh', 'yi', 'yo', 'za', 'zu', 'es', 'es_la', 'pt_br', 'pt_pt', 'ja', 'ja_ro', 'ko', 'ko_ro', 'zh', 'zh_hk', 'zh_ro');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Roles" NOT NULL DEFAULT 'USER',
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "birthDate" TIMESTAMP(3),
    "gender" "Genders" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "city" TEXT,
    "country" TEXT,
    "about" TEXT,
    "contentRating" "ContentRating" NOT NULL DEFAULT 'NSFL',
    "preferredTitleLanguage" "Languages",
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLibrary" (
    "reading" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "rereading" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "planToRead" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "completed" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "onHold" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "dropped" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserHistory" (
    "progression" JSONB[],
    "mediaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "synopsis" TEXT,
    "contentRating" "ContentRating" NOT NULL DEFAULT 'NORMAL',
    "oneShot" BOOLEAN NOT NULL DEFAULT false,
    "trailer" TEXT,
    "type" "MediaType" NOT NULL,
    "status" "MediaStatus" NOT NULL,
    "source" "MediaSource" NOT NULL,
    "demography" "MediaDemography" NOT NULL,
    "countryOfOrigin" "MediaCountryOfOrigin" NOT NULL,
    "genres" "MediaGenres"[],
    "tags" JSONB[],
    "flag" "Flag" NOT NULL DEFAULT 'OK',
    "creatorId" TEXT NOT NULL,
    "deleterId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaCover" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "volume" INTEGER,
    "contentRating" "ContentRating" NOT NULL DEFAULT 'NORMAL',
    "isMainCover" BOOLEAN NOT NULL DEFAULT false,
    "language" "Languages" NOT NULL,
    "mediaId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "deleterId" TEXT,

    CONSTRAINT "MediaCover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaBanner" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "contentRating" "ContentRating" NOT NULL DEFAULT 'NORMAL',
    "mediaId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "deleterId" TEXT,

    CONSTRAINT "MediaBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaTitle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "language" "Languages" NOT NULL,
    "priority" INTEGER NOT NULL,
    "isAcronym" BOOLEAN NOT NULL DEFAULT false,
    "isMainTitle" BOOLEAN NOT NULL DEFAULT false,
    "mediaId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "deleterId" TEXT,

    CONSTRAINT "MediaTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaTracker" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "tracker" "Trackers" NOT NULL,
    "externalId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "deleterId" TEXT,

    CONSTRAINT "MediaTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaChapter" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT,
    "number" INTEGER NOT NULL,
    "volume" INTEGER,
    "language" "Languages" NOT NULL,
    "pages" JSONB[],
    "contentRating" "ContentRating" NOT NULL DEFAULT 'NORMAL',
    "flag" "Flag" NOT NULL DEFAULT 'OK',
    "mediaId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "deleterId" TEXT,

    CONSTRAINT "MediaChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaChapterComment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "content" TEXT NOT NULL,
    "attachments" JSONB[],
    "parentId" TEXT,
    "mediaChapterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deleterId" TEXT,

    CONSTRAINT "MediaChapterComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "UploadSessionStatus" NOT NULL DEFAULT 'PROCESSING',
    "type" "UploadSessionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "mediaChapterId" TEXT,

    CONSTRAINT "UploadSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "website" TEXT,
    "discord" TEXT,
    "twitter" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "telegram" TEXT,
    "youtube" TEXT,
    "email" TEXT,
    "creatorId" TEXT NOT NULL,
    "deleterId" TEXT,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanMember" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "roles" "ScanMemberRoles"[],
    "permissions" "ScanMemberPermissions"[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "ScanMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaChapterToScan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ScanToScanMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLibrary_userId_key" ON "UserLibrary"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserHistory_mediaId_userId_key" ON "UserHistory"("mediaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "MediaTitle_mediaId_language_priority_key" ON "MediaTitle"("mediaId", "language", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "_MediaChapterToScan_AB_unique" ON "_MediaChapterToScan"("A", "B");

-- CreateIndex
CREATE INDEX "_MediaChapterToScan_B_index" ON "_MediaChapterToScan"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ScanToScanMember_AB_unique" ON "_ScanToScanMember"("A", "B");

-- CreateIndex
CREATE INDEX "_ScanToScanMember_B_index" ON "_ScanToScanMember"("B");

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLibrary" ADD CONSTRAINT "UserLibrary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistory" ADD CONSTRAINT "UserHistory_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistory" ADD CONSTRAINT "UserHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaCover" ADD CONSTRAINT "MediaCover_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaCover" ADD CONSTRAINT "MediaCover_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaBanner" ADD CONSTRAINT "MediaBanner_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaBanner" ADD CONSTRAINT "MediaBanner_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTitle" ADD CONSTRAINT "MediaTitle_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTitle" ADD CONSTRAINT "MediaTitle_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTracker" ADD CONSTRAINT "MediaTracker_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTracker" ADD CONSTRAINT "MediaTracker_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaChapter" ADD CONSTRAINT "MediaChapter_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaChapter" ADD CONSTRAINT "MediaChapter_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaChapterComment" ADD CONSTRAINT "MediaChapterComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MediaChapterComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaChapterComment" ADD CONSTRAINT "MediaChapterComment_mediaChapterId_fkey" FOREIGN KEY ("mediaChapterId") REFERENCES "MediaChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaChapterComment" ADD CONSTRAINT "MediaChapterComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadSession" ADD CONSTRAINT "UploadSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanMember" ADD CONSTRAINT "ScanMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaChapterToScan" ADD CONSTRAINT "_MediaChapterToScan_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaChapterToScan" ADD CONSTRAINT "_MediaChapterToScan_B_fkey" FOREIGN KEY ("B") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScanToScanMember" ADD CONSTRAINT "_ScanToScanMember_A_fkey" FOREIGN KEY ("A") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScanToScanMember" ADD CONSTRAINT "_ScanToScanMember_B_fkey" FOREIGN KEY ("B") REFERENCES "ScanMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

