import { Queue } from "bullmq"
import type { ChapterUploadJobData } from "./types"
import { createBullConnection } from "./connection"

export const CHAPTER_UPLOAD_QUEUE = "chapter-upload"

export type ChapterUploadProducer = {
  enqueue: (data: ChapterUploadJobData) => Promise<void>
}

let queue: Queue<ChapterUploadJobData> | undefined

export const getChapterUploadProducer = () =>
  ({
    enqueue: async (data) => {
      if (queue === undefined) {
        queue = new Queue<ChapterUploadJobData>(CHAPTER_UPLOAD_QUEUE, {
          connection: createBullConnection(),
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 5_000 },
            removeOnComplete: { age: 3_600, count: 1_000 },
            removeOnFail: { age: 24 * 3_600 },
          },
        })
        // Unhandled, a Redis connection error would crash the API.
        queue.on("error", (err) => {
          // oxlint-disable-next-line no-console
          console.error(`${CHAPTER_UPLOAD_QUEUE} queue error:`, err.message)
        })
      }

      await queue.add("process", data, { jobId: data.taskId })
    },
  }) satisfies ChapterUploadProducer
