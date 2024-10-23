-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('IMPORT_COVER', 'IMPORT_CHAPTER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'DOWNLOADING', 'UPLOADING', 'FINISHED', 'FAILED');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "TaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
