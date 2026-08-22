import { createBullConnection, reapStaleChapterUploads, type ReaperDeps } from "@taiyomoe/queue"
import { Queue, Worker } from "bullmq"

const CHAPTER_MAINTENANCE_QUEUE = "chapter-maintenance"

const REAP_JOB = "reap-stale-uploads"

// Idempotent: safe to call on every boot and from every replica — BullMQ
// de-dupes repeatable jobs by jobId, so exactly one hourly entry exists.
export const scheduleChapterMaintenance = async () => {
  const queue = new Queue(CHAPTER_MAINTENANCE_QUEUE, { connection: createBullConnection() })

  // Use the older repeat API for broader Redis-compatible store compatibility.
  // BullMQ de-dupes by jobId so multiple boots don't multiply the schedule.
  await queue.add(REAP_JOB, {}, { repeat: { pattern: "0 * * * *" }, jobId: REAP_JOB })
  await queue.close()
}

export const startChapterMaintenanceWorker = (deps: ReaperDeps) =>
  new Worker(
    CHAPTER_MAINTENANCE_QUEUE,
    async () => {
      await reapStaleChapterUploads(deps)
    },
    { connection: createBullConnection(), concurrency: 1 },
  )
