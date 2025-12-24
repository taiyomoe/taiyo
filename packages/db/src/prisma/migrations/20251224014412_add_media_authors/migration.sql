-- DropEnum
DROP TYPE "Trackers";

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('AUTHOR', 'ARTIST');

-- CreateTable
CREATE TABLE "Staff" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "links" JSONB NOT NULL DEFAULT '{}',
    "creatorId" UUID NOT NULL,
    "deleterId" UUID,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffOnMedia" (
    "mediaId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "role" "StaffRole" NOT NULL,

    CONSTRAINT "StaffOnMedia_pkey" PRIMARY KEY ("mediaId","staffId","role")
);

-- CreateIndex
CREATE INDEX "StaffOnMedia_staffId_index" ON "StaffOnMedia"("staffId");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffOnMedia" ADD CONSTRAINT "StaffOnMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffOnMedia" ADD CONSTRAINT "StaffOnMedia_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropIndex
DROP INDEX "_MediaChapterToScan_B_index";
