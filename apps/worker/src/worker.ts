import {
  CHAPTER_UPLOAD_QUEUE,
  type ChapterUploadJobData,
  createBullConnection,
  processChapterUpload,
  type ProcessorDeps,
} from "@taiyomoe/queue"
import { Worker } from "bullmq"
import { env } from "./env"

export const startChapterProcessingWorker = (deps: ProcessorDeps) =>
  new Worker<ChapterUploadJobData>(
    CHAPTER_UPLOAD_QUEUE,
    async (job) => processChapterUpload(deps, job.data),
    { connection: createBullConnection(), concurrency: env.CHAPTER_PROCESSING_CONCURRENCY },
  )
