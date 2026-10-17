import { chapterUploadAudit, systemActor } from "@taiyomoe/audit"
import {
  CHAPTER_UPLOAD_QUEUE,
  type ChapterUploadJobData,
  createBullConnection,
  processChapterUpload,
  type ProcessorDeps,
} from "@taiyomoe/queue"
import { Worker } from "bullmq"
import { audit } from "evlog"
import { env } from "./env"

const actor = systemActor("chapter-upload-worker")

export const startChapterProcessingWorker = (deps: ProcessorDeps) =>
  new Worker<ChapterUploadJobData>(
    CHAPTER_UPLOAD_QUEUE,
    async (job) => {
      try {
        const processed = await processChapterUpload(deps, job.data)

        if (processed !== undefined) {
          audit(
            chapterUploadAudit.PROCESS({
              actor,
              target: { id: job.data.taskId, ...processed },
              outcome: "success",
            }),
          )
        }
      } catch (err) {
        audit(
          chapterUploadAudit.PROCESS({
            actor,
            target: { id: job.data.taskId },
            outcome: "failure",
            reason: err instanceof Error ? err.message : String(err),
          }),
        )

        throw err
      }
    },
    { connection: createBullConnection(), concurrency: env.CHAPTER_PROCESSING_CONCURRENCY },
  )
