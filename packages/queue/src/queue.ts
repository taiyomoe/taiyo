import { Queue } from "bullmq"
import { createBullConnection } from "./connection"
import type { ChapterUploadJobData } from "./types"

export const CHAPTER_UPLOAD_QUEUE = "chapter-upload"

export type ChapterUploadProducer = {
  enqueue: (data: ChapterUploadJobData) => Promise<void>
}

let queue: Queue<ChapterUploadJobData> | undefined
const getQueue = () => {
  if (!queue) {
    queue = new Queue<ChapterUploadJobData>(CHAPTER_UPLOAD_QUEUE, {
      connection: createBullConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: { age: 3_600, count: 1_000 },
        removeOnFail: { age: 24 * 3_600 },
      },
    })
  }

  return queue
}

// Singleton producer injected into the API's Services bundle.
export const getChapterUploadProducer = () =>
  ({
    enqueue: async (data) => {
      await getQueue().add("process", data, { jobId: `chapter-upload:${data.taskId}` })
    },
  }) satisfies ChapterUploadProducer
