import { chapterAudit, chapterUploadAudit, systemActor } from "@taiyomoe/audit"
import {
  createBullConnection,
  publishScheduledChapters,
  reapStaleChapterUploads,
  type ReaperDeps,
} from "@taiyomoe/queue"
import { Queue, Worker } from "bullmq"
import { audit } from "evlog"

const CHAPTER_MAINTENANCE_QUEUE = "chapter-maintenance"
const REAP_JOB = "reap-stale-uploads"
const PUBLISH_JOB = "publish-scheduled-chapters"
const actor = systemActor("chapter-maintenance-worker")

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
        const { chapters } = await publishScheduledChapters(deps)

        for (const { id, mediaId } of chapters) {
          audit(chapterAudit.PUBLISH({ actor, target: { id, mediaId }, outcome: "success" }))
        }

        return
      }

      const { abandonedChapters, tasks } = await reapStaleChapterUploads(deps)

      for (const { id, mediaId } of abandonedChapters) {
        audit(
          chapterUploadAudit.ABANDON({
            actor,
            target: { id, mediaId },
            outcome: "success",
            reason: "PAGES_MISSING",
          }),
        )
      }

      for (const { id, ...task } of tasks) {
        audit(chapterUploadAudit.REAP({ actor, target: { id, ...task }, outcome: "success" }))
      }
    },
    { connection: createBullConnection(), concurrency: 1 },
  )
