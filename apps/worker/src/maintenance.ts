import { chapterUploadAudit, systemActor } from "@taiyomoe/audit"
import { createBullConnection, reapStaleChapterUploads, type ReaperDeps } from "@taiyomoe/queue"
import { Queue, Worker } from "bullmq"
import { audit } from "evlog"

const CHAPTER_MAINTENANCE_QUEUE = "chapter-maintenance"
const REAP_JOB = "reap-stale-uploads"

export const scheduleChapterMaintenance = async () => {
  const queue = new Queue(CHAPTER_MAINTENANCE_QUEUE, { connection: createBullConnection() })

  await queue.upsertJobScheduler(REAP_JOB, { pattern: "0 * * * *" }, { name: REAP_JOB })
  await queue.close()
}

export const startChapterMaintenanceWorker = (deps: ReaperDeps) =>
  new Worker(
    CHAPTER_MAINTENANCE_QUEUE,
    async () => {
      const { tasks } = await reapStaleChapterUploads(deps)

      for (const { id, ...task } of tasks) {
        audit(
          chapterUploadAudit.REAP({
            actor: systemActor("chapter-maintenance-worker"),
            target: { id, ...task },
            outcome: "success",
          }),
        )
      }
    },
    { connection: createBullConnection(), concurrency: 1 },
  )
