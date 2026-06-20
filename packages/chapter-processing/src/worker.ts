import { Worker } from "bullmq"
import { createBullConnection } from "./connection"
import { env } from "./env"
import { processChapterUpload } from "./processor"
import type { ProcessorDeps } from "./processor"
import { CHAPTER_UPLOAD_QUEUE } from "./queue"
import type { ChapterUploadJobData } from "./types"

export const startChapterProcessingWorker = (deps: ProcessorDeps) =>
  new Worker<ChapterUploadJobData>(
    CHAPTER_UPLOAD_QUEUE,
    async (job) => processChapterUpload(deps, job.data),
    { connection: createBullConnection(), concurrency: env.CHAPTER_PROCESSING_CONCURRENCY },
  )
