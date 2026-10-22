import {
  createBullConnection,
  publishScheduledChapters,
  reapStaleChapterUploads,
  type ReaperDeps,
} from "@taiyomoe/queue"
import { Queue, Worker } from "bullmq"

const CHAPTER_MAINTENANCE_QUEUE = "chapter-maintenance"
const REAP_JOB = "reap-stale-uploads"
const PUBLISH_JOB = "publish-scheduled-chapters"

export const scheduleChapterMaintenance = async () => {
  const queue = new Queue(CHAPTER_MAINTENANCE_QUEUE, { connection: createBullConnection() })

  await queue.upsertJobScheduler(REAP_JOB, { pattern: "0 * * * *" }, { name: REAP_JOB })
  await queue.upsertJobScheduler(PUBLISH_JOB, { every: 60_000 }, { name: PUBLISH_JOB })
  await queue.close()
}

export const startChapterMaintenanceWorker = (deps: ReaperDeps) =>
  new Worker(
    CHAPTER_MAINTENANCE_QUEUE,
    async (job) => {
      if (job.name === PUBLISH_JOB) {
        await publishScheduledChapters(deps)

        return
      }

      await reapStaleChapterUploads(deps)
    },
    { connection: createBullConnection(), concurrency: 1 },
  )
